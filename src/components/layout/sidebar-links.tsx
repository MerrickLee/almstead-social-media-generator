"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export function SidebarLinks({ items }: { items: NavItem[] }) {
    const pathname = usePathname();

    return (
        <div className="space-y-1">
            {items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            isActive ? 'bg-secondary text-secondary-foreground' : 'text-card-foreground hover:bg-muted',
                            'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
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
    );
}
