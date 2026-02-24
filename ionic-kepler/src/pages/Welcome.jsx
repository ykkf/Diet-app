import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Welcome = () => {
    const { createInitialUser } = useAppContext();
    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [targetWeight, setTargetWeight] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && height && targetWeight) {
            createInitialUser(name, height, targetWeight);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in">
                <h1 className="text-center" style={{
                    marginBottom: '2rem',
                    fontSize: '2rem',
                    background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Diet Tracker
                </h1>

                <Card title="はじめよう">
                    <p className="text-center" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>プロフィールを入力してダイエット記録を開始しましょう。</p>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="お名前"
                            placeholder="ニックネーム"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="身長 (cm)"
                            type="number"
                            step="0.1"
                            placeholder="例: 170.5"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            required
                        />
                        <Input
                            label="目標体重 (kg)"
                            type="number"
                            step="0.1"
                            placeholder="例: 65.0"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(e.target.value)}
                            required
                        />
                        <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                            スタート
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Welcome;
