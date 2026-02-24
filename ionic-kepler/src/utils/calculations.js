import { v4 as uuidv4 } from 'uuid';

export const calculateBMI = (weight, heightCm) => {
    if (!weight || !heightCm) return null;
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
};

export const calculateTotalCalories = (mealLogs, foods) => {
    return mealLogs.reduce((total, log) => {
        const food = foods.find(f => f.id === log.foodId);
        if (!food) return total;
        return total + (food.calories * log.quantity);
    }, 0);
};

export const generateUUID = () => uuidv4();
