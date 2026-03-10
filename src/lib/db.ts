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
            "addedAt" TIMESTAMPTZ DEFAULT NOW()
        )
    `;
}

// Helper: Check if an email is permitted to sign in
export async function isEmailAllowed(email: string): Promise<boolean> {
    // Hardcoded Admin email always has access
    if (email.toLowerCase() === 'mlee@almstead.com') {
        return true;
    }
    if (email.toLowerCase() === 'merricklee@me.com') {
        return true;
    }

    const sql = getDb();
    await ensureTable();
    const rows = await sql`
        SELECT 1 FROM allowlist WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1
    `;
    return rows.length > 0;
}

// Helper: Add an email to the allowlist
export async function addAllowedEmail(email: string): Promise<boolean> {
    const sql = getDb();
    await ensureTable();
    try {
        await sql`
            INSERT INTO allowlist (email) VALUES (${email.toLowerCase()})
            ON CONFLICT (email) DO NOTHING
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
export async function getAllAllowedEmails(): Promise<{ email: string; addedAt: string }[]> {
    const sql = getDb();
    await ensureTable();
    const rows = await sql`
        SELECT email, "addedAt" FROM allowlist ORDER BY "addedAt" DESC
    `;
    return rows as { email: string; addedAt: string }[];
}
