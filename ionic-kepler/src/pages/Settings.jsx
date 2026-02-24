import React, { useRef, useState } from 'react';
import { db } from '../services/db';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Settings = () => {
    const { users, activeUser, activeUserId, switchUser, createInitialUser } = useAppContext();
    const fileInputRef = useRef(null);

    // New user form state
    const [newName, setNewName] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [newTarget, setNewTarget] = useState('');

    // Edit target weight
    const [editTarget, setEditTarget] = useState('');
    const [isEditingTarget, setIsEditingTarget] = useState(false);

    const handleAddUser = (e) => {
        e.preventDefault();
        if (newName && newHeight && newTarget) {
            createInitialUser(newName, newHeight, newTarget);
            setNewName('');
            setNewHeight('');
            setNewTarget('');
        }
    };

    const handleUpdateTargetWeight = async () => {
        if (activeUserId && editTarget) {
            await db.users.update(activeUserId, { targetWeight: Number(editTarget) });
            setIsEditingTarget(false);
            setEditTarget('');
        }
    };

    const handleExportData = async () => {
        try {
            const allUsers = await db.users.toArray();
            const allFoods = await db.foods.toArray();
            const allMealLogs = await db.mealLogs.toArray();
            const allWeightLogs = await db.weightLogs.toArray();

            const backup = {
                users: allUsers,
                foods: allFoods,
                mealLogs: allMealLogs,
                weightLogs: allWeightLogs,
                timestamp: new Date().toISOString(),
                version: 1
            };

            const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diet_tracker_backup_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Export failed', e);
            alert('エクスポートに失敗しました。');
        }
    };

    const handleImportData = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm('現在のデータはすべて上書きされます。よろしいですか？')) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.users && data.foods && data.mealLogs && data.weightLogs) {
                        await db.transaction('rw', db.users, db.foods, db.mealLogs, db.weightLogs, async () => {
                            await db.users.clear();
                            await db.foods.clear();
                            await db.mealLogs.clear();
                            await db.weightLogs.clear();

                            await db.users.bulkAdd(data.users);
                            await db.foods.bulkAdd(data.foods);
                            await db.mealLogs.bulkAdd(data.mealLogs);
                            await db.weightLogs.bulkAdd(data.weightLogs);
                        });
                        alert('データを復元しました。');
                        window.location.reload();
                    } else {
                        alert('無効なバックアップファイルです。');
                    }
                } catch (err) {
                    console.error('Import failed', err);
                    alert('インポートに失敗しました。ファイルが破損している可能性があります。');
                }
            };
            reader.readAsText(file);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleResetData = async () => {
        if (window.confirm('すべてのデータが完全に削除されます。本当によろしいですか？')) {
            if (window.confirm('※最終確認※ 削除されたデータは復元できません。実行しますか？')) {
                await db.transaction('rw', db.users, db.foods, db.mealLogs, db.weightLogs, async () => {
                    await db.users.clear();
                    await db.foods.clear();
                    await db.mealLogs.clear();
                    await db.weightLogs.clear();
                });
                localStorage.removeItem('activeUserId');
                window.location.href = '/';
            }
        }
    };

    return (
        <div className="flex-col gap-4">
            <h1 className="mb-4">設定</h1>

            <Card title="ユーザー管理">
                <div className="mb-6">
                    <label className="input-label">現在のユーザーを切り替え</label>
                    <select
                        className="input-field mt-1"
                        value={activeUserId || ''}
                        onChange={(e) => switchUser(e.target.value)}
                    >
                        {users?.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6 border-t border-white/10 pt-4">
                    <label className="input-label mb-2 block">目標体重の変更</label>
                    {isEditingTarget ? (
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                placeholder={activeUser?.targetWeight?.toString()}
                                value={editTarget}
                                onChange={(e) => setEditTarget(e.target.value)}
                                className="flex-1 !mb-0"
                            />
                            <Button onClick={handleUpdateTargetWeight}>保存</Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <span>{activeUser?.targetWeight || '--'} kg</span>
                            <Button variant="secondary" className="!px-3 !py-1 text-sm" onClick={() => setIsEditingTarget(true)}>
                                変更
                            </Button>
                        </div>
                    )}
                </div>

                <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold mb-3">新しいユーザーを追加</h4>
                    <form onSubmit={handleAddUser} className="flex-col gap-2">
                        <Input placeholder="名前" value={newName} onChange={e => setNewName(e.target.value)} className="!mb-0" required />
                        <div className="flex gap-2">
                            <Input type="number" step="0.1" placeholder="身長(cm)" value={newHeight} onChange={e => setNewHeight(e.target.value)} className="flex-1 !mb-0" required />
                            <Input type="number" step="0.1" placeholder="目標体重(kg)" value={newTarget} onChange={e => setNewTarget(e.target.value)} className="flex-1 !mb-0" required />
                        </div>
                        <Button type="submit" variant="secondary" className="mt-2">追加</Button>
                    </form>
                </div>
            </Card>

            <Card title="データ管理" className="mb-8">
                <div className="flex-col gap-3">
                    <Button onClick={handleExportData} className="w-full flex justify-center border border-cyan-500/30">
                        データをエクスポート (JSON)
                    </Button>

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="secondary"
                        className="w-full flex justify-center"
                    >
                        データをインポート (復元)
                    </Button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImportData}
                        style={{ display: 'none' }}
                    />

                    <Button
                        onClick={handleResetData}
                        variant="danger"
                        className="w-full flex justify-center mt-4"
                    >
                        全データ初期化
                    </Button>
                </div>
            </Card>

            <div className="text-center text-xs text-muted mb-6">
                Diet Tracker App version 1.0.0
            </div>
        </div>
    );
};

export default Settings;
