import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Define the database path (stored in the root of the project for simplicity)
const dbPath = path.join(process.cwd(), 'almstead.sqlite');

let dbInstance: Database | null = null;

// Initialize and connect to the database
export async function getDb(): Promise<Database> {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Ensure the Allowlist table exists
    await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS allowlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      addedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

    return dbInstance;
}

// Helper: Check if an email is perfectly authorized
export async function isEmailAllowed(email: string): Promise<boolean> {
    // Hardcoded Admin email always has access
    if (email.toLowerCase() === 'mlee@almstead.com') {
        return true;
    }

    const db = await getDb();
    const row = await db.get('SELECT * FROM allowlist WHERE LOWER(email) = ?', [email.toLowerCase()]);
    return !!row;
}

// Helper: Add an email to the allowlist
export async function addAllowedEmail(email: string): Promise<boolean> {
    const db = await getDb();
    try {
        await db.run('INSERT INTO allowlist (email) VALUES (?)', [email.toLowerCase()]);
        return true;
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            // Email already exists
            return false;
        }
        throw error;
    }
}

// Helper: Remove an email from the allowlist
export async function removeAllowedEmail(email: string): Promise<void> {
    const db = await getDb();
    await db.run('DELETE FROM allowlist WHERE LOWER(email) = ?', [email.toLowerCase()]);
}

// Helper: Get all allowed emails (for Admin view)
export async function getAllAllowedEmails(): Promise<{ email: string, addedAt: string }[]> {
    const db = await getDb();
    return await db.all('SELECT email, addedAt FROM allowlist ORDER BY addedAt DESC');
}
