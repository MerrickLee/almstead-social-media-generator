import { neon } from '@neondatabase/serverless';

function getDb() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
        throw new Error('POSTGRES_URL environment variable is not set.');
    }
    return neon(connectionString);
}

// Ensure the allowlist table exists (called on first use)
async function ensureTable() {
    const sql = getDb();
    await sql`
        CREATE TABLE IF NOT EXISTS allowlist (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL DEFAULT 'editor',
            "addedAt" TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    
    // Check if role column exists (for backward compatibility if table already existed)
    try {
        await sql`SELECT role FROM allowlist LIMIT 1`;
    } catch (e) {
        console.log("Adding role column to allowlist table...");
        await sql`ALTER TABLE allowlist ADD COLUMN role TEXT NOT NULL DEFAULT 'editor'`;
    }
}

// Helper: Check if an email is permitted to sign in
export async function isEmailAllowed(email: string): Promise<boolean> {
    // Hardcoded Admin emails always have access
    const hardcodedAdmins = ['mlee@almstead.com', 'merricklee@me.com'];
    if (hardcodedAdmins.includes(email.toLowerCase())) {
        return true;
    }

    const sql = getDb();
    await ensureTable();
    const rows = await sql`
        SELECT 1 FROM allowlist WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1
    `;
    return rows.length > 0;
}

// Helper: Get user role
export async function getUserRole(email: string): Promise<string> {
    const adminEmails = ['mlee@almstead.com', 'merricklee@me.com'];
    if (adminEmails.includes(email.toLowerCase())) {
        return 'admin';
    }

    const sql = getDb();
    await ensureTable();
    const rows = await sql`
        SELECT role FROM allowlist WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1
    `;
    return rows.length > 0 ? (rows[0].role as string) : 'editor';
}

// Helper: Add an email to the allowlist
export async function addAllowedEmail(email: string, role: string = 'editor'): Promise<boolean> {
    const sql = getDb();
    await ensureTable();
    try {
        await sql`
            INSERT INTO allowlist (email, role) VALUES (${email.toLowerCase()}, ${role})
            ON CONFLICT (email) DO UPDATE SET role = ${role}
        `;
        return true;
    } catch (error: any) {
        throw error;
    }
}

// Helper: Remove an email from the allowlist
export async function removeAllowedEmail(email: string): Promise<void> {
    const sql = getDb();
    await ensureTable();
    await sql`
        DELETE FROM allowlist WHERE LOWER(email) = ${email.toLowerCase()}
    `;
}

// Helper: Get all allowed emails (for Admin view)
export async function getAllAllowedEmails(): Promise<{ email: string; role: string; addedAt: string }[]> {
    const sql = getDb();
    await ensureTable();
    const rows = await sql`
        SELECT email, role, "addedAt" FROM allowlist ORDER BY "addedAt" DESC
    `;
    return rows as { email: string; role: string; addedAt: string }[];
}
