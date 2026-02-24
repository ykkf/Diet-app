import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import { generateUUID } from '../utils/calculations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Weight = () => {
    const { activeUserId } = useAppContext();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [weight, setWeight] = useState('');

    const weightLogs = useLiveQuery(
        () => db.weightLogs
            .where('userId')
            .equals(activeUserId || '')
            .reverse()
            .sortBy('date'),
        [activeUserId]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!weight || !date) return;

        // Check if log already exists for this date
        const existingLog = await db.weightLogs
            .where({ userId: activeUserId, date: date })
            .first();

        if (existingLog) {
            await db.weightLogs.update(existingLog.id, { weight: Number(weight) });
        } else {
            await db.weightLogs.add({
                id: generateUUID(),
                userId: activeUserId,
                date,
                weight: Number(weight)
            });
        }

        setWeight(''); // Clear input after save
    };

    const handleDelete = async (id) => {
        if (window.confirm('本当に削除しますか？')) {
            await db.weightLogs.delete(id);
        }
    };

    return (
        <div className="flex-col gap-4">
            <h1 className="mb-4">体重記録</h1>

            <Card title="新しい記録">
                <form onSubmit={handleSubmit}>
                    <Input
                        label="日付"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                    <Input
                        label="体重 (kg)"
                        type="number"
                        step="0.1"
                        placeholder="例: 65.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full mt-2" style={{ width: '100%' }}>
                        保存
                    </Button>
                </form>
            </Card>

            <h2 className="mt-8 mb-4 border-b border-gray-700 pb-2">履歴</h2>

            <div className="flex-col gap-2">
                {weightLogs?.length === 0 ? (
                    <p className="text-center text-muted">記録がありません。</p>
                ) : (
                    weightLogs?.map(log => (
                        <div key={log.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 mb-2">
                            <div>
                                <div className="text-sm text-secondary">{log.date}</div>
                                <div className="font-semibold text-lg">{log.weight.toFixed(1)} <span className="text-sm font-normal text-muted">kg</span></div>
                            </div>
                            <button
                                onClick={() => handleDelete(log.id)}
                                className="text-red-400 p-2"
                                style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                            >
                                削除
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Weight;
