import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

export default async function Header() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Social Media Hub</h2>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-semibold">{user.name || "Employee"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        {user.image && (
                            <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full border border-border" />
                        )}
                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}>
                            <button
                                type="submit"
                                title="Sign Out"
                                className="p-2 ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                ) : null}
            </div>
        </header>
    );
}
