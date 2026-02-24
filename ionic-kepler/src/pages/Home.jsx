import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, subDays, startOfMonth, parseISO } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import { calculateBMI, calculateTotalCalories } from '../utils/calculations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Home = () => {
    const { activeUser, activeUserId } = useAppContext();
    const [chartMode, setChartMode] = useState('daily'); // 'daily' | 'monthly'

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const weightLogs = useLiveQuery(
        () => db.weightLogs
            .where('userId')
            .equals(activeUserId || '')
            .sortBy('date'),
        [activeUserId]
    );

    const todaysMealLogs = useLiveQuery(
        () => db.mealLogs
            .where('[userId+date]')
            .equals([activeUserId || '', todayStr])
            .toArray(),
        [activeUserId]
    );

    const foods = useLiveQuery(() => db.foods.toArray());

    // Calculations
    const latestWeightLog = weightLogs && weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
    const previousWeightLog = weightLogs && weightLogs.length > 1 ? weightLogs[weightLogs.length - 2] : null;

    const currentWeight = latestWeightLog?.weight || 0;
    const weightDiff = (currentWeight && previousWeightLog)
        ? (currentWeight - previousWeightLog.weight).toFixed(1)
        : 0;

    const targetDiff = activeUser?.targetWeight ? (currentWeight - activeUser.targetWeight).toFixed(1) : 0;
    const bmi = calculateBMI(currentWeight, activeUser?.height);

    const todaysCalories = (todaysMealLogs && foods) ? calculateTotalCalories(todaysMealLogs, foods) : 0;

    // Chart Data Processing
    const chartData = useMemo(() => {
        if (!weightLogs || weightLogs.length === 0) return [];

        if (chartMode === 'daily') {
            const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
            return weightLogs
                .filter(log => log.date >= thirtyDaysAgo)
                .map(log => ({
                    date: format(parseISO(log.date), 'MM/dd'),
                    weight: log.weight
                }));
        } else {
            // Monthly average
            const monthlyGroups = weightLogs.reduce((acc, log) => {
                const monthKey = format(parseISO(log.date), 'yyyy-MM');
                if (!acc[monthKey]) acc[monthKey] = { sum: 0, count: 0 };
                acc[monthKey].sum += log.weight;
                acc[monthKey].count += 1;
                return acc;
            }, {});

            return Object.entries(monthlyGroups).map(([month, data]) => ({
                date: format(parseISO(`${month}-01`), 'yyyy/MM'),
                weight: Number((data.sum / data.count).toFixed(1))
            }));
        }
    }, [weightLogs, chartMode]);

    const minWeight = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) - 2 : 'dataMin';
    const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) + 2 : 'dataMax';

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-sm font-normal text-secondary mb-1">こんにちは、</h2>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                        {activeUser?.name} さん
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-2">
                {/* Current Weight Card */}
                <Card className="flex flex-col justify-center items-center py-4" style={{ marginBottom: 0 }}>
                    <p className="text-secondary text-sm mb-1">現在の体重</p>
                    <div className="text-2xl font-bold">
                        {currentWeight || '--'} <span className="text-sm font-normal text-muted">kg</span>
                    </div>
                    {currentWeight > 0 && (
                        <p className={`text-xs mt-1 ${weightDiff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            前日比 {weightDiff > 0 ? '+' : ''}{weightDiff} kg
                        </p>
                    )}
                </Card>

                {/* Target Progress Card */}
                <Card className="flex flex-col justify-center items-center py-4" style={{ marginBottom: 0 }}>
                    <p className="text-secondary text-sm mb-1">目標まであと</p>
                    <div className="text-2xl font-bold text-purple-400">
                        {targetDiff > 0 ? targetDiff : 0} <span className="text-sm font-normal text-muted">kg</span>
                    </div>
                    <p className="text-xs text-muted mt-1">
                        目標: {activeUser?.targetWeight} kg
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Today's Calories */}
                <Card className="flex flex-col justify-center items-center py-4" style={{ marginBottom: 0 }}>
                    <p className="text-secondary text-sm mb-1">今日の摂取カロリー</p>
                    <div className="text-2xl font-bold text-cyan-400">
                        {todaysCalories.toLocaleString()} <span className="text-sm font-normal text-muted">kcal</span>
                    </div>
                </Card>

                {/* BMI */}
                <Card className="flex flex-col justify-center items-center py-4" style={{ marginBottom: 0 }}>
                    <p className="text-secondary text-sm mb-1">BMI</p>
                    <div className="text-2xl font-bold text-amber-400">
                        {bmi || '--'}
                    </div>
                </Card>
            </div>

            {/* Chart Section */}
            <Card title="体重推移" action={
                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                    <Button
                        variant={chartMode === 'daily' ? 'primary' : 'secondary'}
                        className="!px-3 !py-1 text-xs"
                        onClick={() => setChartMode('daily')}
                    >
                        日別
                    </Button>
                    <Button
                        variant={chartMode === 'monthly' ? 'primary' : 'secondary'}
                        className="!px-3 !py-1 text-xs"
                        onClick={() => setChartMode('monthly')}
                    >
                        月別
                    </Button>
                </div>
            }>
                <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted">データがありません</div>
                    ) : (
                        <ResponsiveContainer>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-cyan)' }}
                                />
                                <Area type="monotone" dataKey="weight" stroke="var(--accent-purple)" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Home;
