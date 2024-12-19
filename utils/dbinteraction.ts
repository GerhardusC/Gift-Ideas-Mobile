import * as SQLite from 'expo-sqlite';

export const getGifts = async () => {
    try {
        const db = await SQLite.openDatabaseAsync("gifts");
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS gifts (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            gift varchar(255)
            );                
        `)
        const currentGifts = await db.getAllAsync<Gift>("SELECT * FROM gifts;")
        return currentGifts;
    } catch (err) {
        return false;
    }
}

export const addGift = async () => {
    try {
        
    } catch (err) {
        return false;
    }
}
