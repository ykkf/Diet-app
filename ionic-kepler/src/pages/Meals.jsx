import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import { generateUUID } from '../utils/calculations';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const MEAL_TYPES = [
    { id: 'breakfast', label: '朝食' },
    { id: 'lunch', label: '昼食' },
    { id: 'dinner', label: '夕食' },
    { id: 'snack', label: '間食' }
];

const Meals = () => {
    const { activeUserId } = useAppContext();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState(null);
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const foods = useLiveQuery(
        () => db.foods.where('userId').equals(activeUserId || '').toArray(),
        [activeUserId]
    );

    const mealLogs = useLiveQuery(
        () => db.mealLogs
            .where('[userId+date]')
            .equals([activeUserId || '', date])
            .toArray(),
        [activeUserId, date]
    );

    const handleOpenModal = (mealType) => {
        setSelectedMealType(mealType);
        setSelectedFoodId(foods && foods.length > 0 ? foods[0].id : '');
        setQuantity(1);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMealType(null);
    };

    const handleAddMealLog = async (e) => {
        e.preventDefault();
        if (!selectedFoodId || !quantity || !selectedMealType) return;

        await db.mealLogs.add({
            id: generateUUID(),
            userId: activeUserId,
            date,
            mealType: selectedMealType,
            foodId: selectedFoodId,
            quantity: Number(quantity)
        });

        handleCloseModal();
    };

    const handleDeleteLog = async (id) => {
        if (window.confirm('本当に削除しますか？')) {
            await db.mealLogs.delete(id);
        }
    };

    const getFoodInfo = (foodId) => foods?.find(f => f.id === foodId);

    const calculateDailyTotal = () => {
        if (!mealLogs || !foods) return 0;
        return mealLogs.reduce((total, log) => {
            const food = getFoodInfo(log.foodId);
            if (!food) return total;
            return total + (food.calories * log.quantity);
        }, 0);
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
                <h1>食事記録</h1>
            </div>

            <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mb-6"
            />

            <div className="flex-col gap-4 mb-8">
                {MEAL_TYPES.map(type => {
                    const typeLogs = mealLogs?.filter(log => log.mealType === type.id) || [];

                    return (
                        <Card key={type.id} title={type.label} action={
                            <Button variant="secondary" onClick={() => handleOpenModal(type.id)} className="!p-2 text-sm">
                                <Plus size={16} />
                            </Button>
                        }>
                            {typeLogs.length === 0 ? (
                                <p className="text-sm text-muted">記録がありません。</p>
                            ) : (
                                <div className="flex-col gap-2">
                                    {typeLogs.map(log => {
                                        const food = getFoodInfo(log.foodId);
                                        if (!food) return null;
                                        const logCalories = food.calories * log.quantity;

                                        return (
                                            <div key={log.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                                <div>
                                                    <div className="font-medium text-sm text-primary">{food.name} ({log.quantity}{food.unit})</div>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-secondary">{logCalories.toFixed(0)} kcal</span>
                                                    <button
                                                        onClick={() => handleDeleteLog(log.id)}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Daily Total Fixed at bottom above Nav */}
            <div className="glass-panel text-center" style={{ padding: '1rem', marginTop: 'auto' }}>
                <p className="text-secondary text-sm mb-1" style={{ marginBottom: '0.25rem' }}>当日の合計カロリー</p>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {calculateDailyTotal().toLocaleString()} <span className="text-sm text-muted font-normal">kcal</span>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={`${MEAL_TYPES.find(t => t.id === selectedMealType)?.label}に追加`}
            >
                <form onSubmit={handleAddMealLog}>
                    {foods?.length === 0 ? (
                        <p className="text-center text-muted my-4">先に食品管理から食品を登録してください。</p>
                    ) : (
                        <>
                            <div className="input-group">
                                <label className="input-label">食品</label>
                                <select
                                    className="input-field mb-4"
                                    value={selectedFoodId}
                                    onChange={(e) => setSelectedFoodId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>食品を選択してください</option>
                                    {foods?.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} ({f.calories}kcal/{f.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="数量"
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                            <div className="flex justify-between gap-4 mt-6">
                                <Button variant="secondary" onClick={handleCloseModal} style={{ flex: 1 }}>
                                    キャンセル
                                </Button>
                                <Button type="submit" style={{ flex: 1 }}>
                                    追加
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>
        </div>
    );
};

export default Meals;
