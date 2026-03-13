import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllAllowedEmails, addAllowedEmail, removeAllowedEmail } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ShieldAlert, Trash2, Plus, Mail } from "lucide-react";

export default async function AdminPage() {
    const session = await auth();

    // STRICT PROTECTION: Only admins can access this page
    if (session?.user?.role !== "admin") {
        redirect("/");
    }

    const allowedEmails = await getAllAllowedEmails();

    // Inline Server Actions for form submissions
    async function handleAdd(formData: FormData) {
        "use server";
        const email = formData.get("email") as string;
        const role = formData.get("role") as string || 'editor';
        if (!email) return;

        await addAllowedEmail(email, role);
        revalidatePath("/admin");
    }

    async function handleRemove(formData: FormData) {
        "use server";
        const email = formData.get("email") as string;
        if (!email) return;

        await removeAllowedEmail(email);
        revalidatePath("/admin");
    }

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in">
            <div className="flex items-center gap-3 border-b pb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
                    <p className="text-muted-foreground">Manage which employees are allowed to sign in and use the application.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                {/* Add New User Panel */}
                <div className="bg-card border rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" /> Add Employee
                    </h3>
                    <form action={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Google Account Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="name@example.com"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">Role Status</label>
                            <select
                                id="role"
                                name="role"
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                <option value="editor">Editor (Send to Merrick only)</option>
                                <option value="admin">Admin (All Access)</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                            Grant Access
                        </button>
                    </form>
                </div>

                {/* Allowed Users List */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b bg-muted/20">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" /> Allowed Accounts ({allowedEmails.length + 1})
                        </h3>
                        <p className="text-sm text-muted-foreground">These accounts will bypass the authorization block.</p>
                    </div>

                    <div className="divide-y max-h-[500px] overflow-y-auto">
                        {/* Always show the root admin */}
                        <div className="flex items-center justify-between p-4 bg-primary/5">
                            <div>
                                <p className="font-semibold text-sm">mlee@almstead.com</p>
                                <p className="text-xs text-muted-foreground">System Administrator (Immutable)</p>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                OWNER
                            </span>
                        </div>

                        {allowedEmails.map((record) => (
                            <div key={record.email} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div>
                                    <p className="font-medium text-sm">{record.email}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Role: <span className="capitalize font-semibold text-primary">{record.role}</span> • Added {new Date(record.addedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <form action={handleRemove}>
                                    <input type="hidden" name="email" value={record.email} />
                                    <button
                                        type="submit"
                                        title="Revoke Access"
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        ))}

                        {allowedEmails.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                                <Mail className="w-8 h-8 opacity-20" />
                                <p>No additional employees have been whitelisted yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
