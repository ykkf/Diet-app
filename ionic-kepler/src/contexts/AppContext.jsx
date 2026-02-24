import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { generateUUID } from '../utils/calculations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [activeUserId, setActiveUserId] = useState(() => {
        return localStorage.getItem('activeUserId') || null;
    });

    const users = useLiveQuery(() => db.users.toArray());

    // Set initial active user if missing but users exist
    useEffect(() => {
        if (users && users.length > 0 && (!activeUserId || !users.find(u => u.id === activeUserId))) {
            const firstUser = users[0].id;
            setActiveUserId(firstUser);
            localStorage.setItem('activeUserId', firstUser);
        }
    }, [users, activeUserId]);

    const activeUser = users?.find(u => u.id === activeUserId) || null;

    const createInitialUser = async (name, height, targetWeight) => {
        const newUser = {
            id: generateUUID(),
            name,
            height: Number(height),
            targetWeight: Number(targetWeight),
            targetCalories: 2000,
            gender: 'other'
        };
        await db.users.add(newUser);
        setActiveUserId(newUser.id);
        localStorage.setItem('activeUserId', newUser.id);
    };

    const switchUser = (userId) => {
        setActiveUserId(userId);
        localStorage.setItem('activeUserId', userId);
    };

    return (
        <AppContext.Provider value={{
            users,
            activeUser,
            activeUserId,
            createInitialUser,
            switchUser,
            isLoading: users === undefined
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
