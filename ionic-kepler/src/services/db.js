import Dexie from 'dexie';

export const db = new Dexie('DietTrackerDB');

db.version(1).stores({
  users: 'id, name',
  foods: 'id, userId',
  mealLogs: 'id, userId, date, mealType',
  weightLogs: 'id, userId, date'
});
