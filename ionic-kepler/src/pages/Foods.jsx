import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import { generateUUID } from '../utils/calculations';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const Foods = () => {
    const { activeUserId } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFood, setEditingFood] = useState(null);

    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [unit, setUnit] = useState('g');

    const foods = useLiveQuery(
        () => db.foods.where('userId').equals(activeUserId || '').toArray(),
        [activeUserId]
    );

    const handleOpenModal = (food = null) => {
        if (food) {
            setEditingFood(food);
            setName(food.name);
            setCalories(food.calories);
            setUnit(food.unit);
        } else {
            setEditingFood(null);
            setName('');
            setCalories('');
            setUnit('g');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFood(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !calories || !unit) return;

        if (editingFood) {
            await db.foods.update(editingFood.id, {
                name,
                calories: Number(calories),
                unit
            });
        } else {
            await db.foods.add({
                id: generateUUID(),
                userId: activeUserId,
                name,
                calories: Number(calories),
                unit
            });
        }
        handleCloseModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('本当に削除しますか？')) {
            await db.foods.delete(id);
        }
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
                <h1>食品管理</h1>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus size={18} /> 追加
                </Button>
            </div>

            <div className="flex-col gap-4">
                {foods?.length === 0 ? (
                    <p className="text-center text-muted mt-8">食品が登録されていません。<br />右上のボタンから追加してください。</p>
                ) : (
                    foods?.map((food) => (
                        <Card key={food.id} className="mb-2" style={{ padding: '1rem' }}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{food.name}</h3>
                                    <span className="text-sm text-secondary">
                                        {food.calories} kcal / {food.unit}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(food)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '0.25rem' }}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(food.id)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.25rem' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingFood ? '食品を編集' : '食品を追加'}
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="食品名"
                        placeholder="例: 白米"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="カロリー (kcal)"
                        type="number"
                        placeholder="例: 156"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        required
                    />
                    <Input
                        label="単位"
                        placeholder="例: 100g, 1人前, 1個"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        required
                    />
                    <div className="flex justify-between gap-4 mt-4">
                        <Button variant="secondary" onClick={handleCloseModal} style={{ flex: 1 }}>
                            キャンセル
                        </Button>
                        <Button type="submit" style={{ flex: 1 }}>
                            保存
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Foods;
