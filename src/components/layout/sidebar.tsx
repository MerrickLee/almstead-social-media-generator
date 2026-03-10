import React from "react";
import { auth } from "@/auth";
import { SidebarLinks } from "./sidebar-links";

const navigation = [
    { name: 'Image Brander', href: '/', icon: 'Compass' },
    { name: 'Composer', href: '/composer', icon: 'PenTool' },
    { name: 'Calendar', href: '/calendar', icon: 'Calendar' },
];

export async function Sidebar() {
    const session = await auth();
    const isAdmin = session?.user?.email === "mlee@almstead.com";

    const userAvatar = session?.user?.image;
    const userName = session?.user?.name || "Employee";

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 shrink-0 items-center px-6 bg-[#032a29] border-b border-border">
                <img src="https://almstead.mystagingwebsite.com/wp-content/uploads/2025/11/horizontal-almstead-logo-3.svg" alt="Almstead" className="h-8 w-auto" />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-4 py-6">
                    <div className="mb-4">
                        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Workspace</h3>
                        <SidebarLinks items={navigation} />

                        {isAdmin && (
                            <div className="mt-8">
                                <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Admin</h3>
                                <SidebarLinks items={[{ name: "Access Control", href: "/admin", icon: 'ShieldAlert' }]} />
                            </div>
                        )}
                    </div>
                </nav>
            </div>
            <div className="flex shrink-0 border-t border-border p-4 bg-muted/30">
                <div className="flex items-center">
                    <div>
                        {userAvatar ? (
                            <img src={userAvatar} alt="Profile" className="h-8 w-8 rounded-full border border-border" />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-card-foreground">{userName}</p>
                        <p className="text-xs font-medium text-muted-foreground">{isAdmin ? "Administrator" : "Employee"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
