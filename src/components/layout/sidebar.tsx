"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Leaf,
    Home,
    Settings,
    Image as ImageIcon,
    Calendar,
    PenTool
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: 'Image Brander', href: '/', icon: ImageIcon },
    { name: 'Start Post', href: '/composer', icon: PenTool },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            <div className="flex h-16 shrink-0 items-center px-6 bg-[#032a29] border-b border-border">
                <img src="https://almstead.mystagingwebsite.com/wp-content/uploads/2025/11/horizontal-almstead-logo-3.svg" alt="Almstead" className="h-8 w-auto" />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-4 py-6">
                    <div className="mb-4">
                        <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Workspace</h3>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive ? 'bg-secondary text-secondary-foreground' : 'text-card-foreground hover:bg-muted',
                                        'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors mb-1'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary',
                                            'mr-3 h-5 w-5 shrink-0'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
            <div className="flex shrink-0 border-t border-border p-4 bg-muted/30">
                <div className="flex items-center">
                    <div>
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            M
                        </div>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-card-foreground">Marketing Team</p>
                        <p className="text-xs font-medium text-muted-foreground">Editor</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
