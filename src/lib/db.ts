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

    // Create posts table
    await sql`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            image_urls TEXT[] NOT NULL,
            pillar TEXT,
            author_email TEXT NOT NULL,
            author_name TEXT,
            workflow TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
}

export interface Post {
    id: number;
    text: string;
    image_urls: string[];
    pillar: string | null;
    author_email: string;
    author_name: string | null;
    workflow: string;
    created_at: string;
}

// Helper: Save a new post
export async function savePost(post: Omit<Post, 'id' | 'created_at'>): Promise<void> {
    const sql = getDb();
    await ensureTable();
    await sql`
        INSERT INTO posts (text, image_urls, pillar, author_email, author_name, workflow)
        VALUES (${post.text}, ${post.image_urls}, ${post.pillar}, ${post.author_email}, ${post.author_name}, ${post.workflow})
    `;
}

// Helper: Get posts for a specific month
export async function getPostsByMonth(year: number, month: number): Promise<Post[]> {
    const sql = getDb();
    await ensureTable();
    // month is 1-indexed (1-12)
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    const rows = await sql`
        SELECT id, text, image_urls, pillar, author_email, author_name, workflow, created_at 
        FROM posts 
        WHERE created_at >= ${startDate} AND created_at < ${endDate}
        ORDER BY created_at ASC
    `;
    return rows as Post[];
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
