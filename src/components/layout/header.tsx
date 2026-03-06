"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export function Header() {
    const pathname = usePathname();

    // Create a nice title from the pathname
    const getTitle = () => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.includes('/science')) return 'Science of Landscapes';
        if (pathname.includes('/conditions')) return 'Current Conditions';
        if (pathname.includes('/customers')) return 'Happy Customers';
        if (pathname.includes('/employees')) return 'Employee Spotlights';
        if (pathname.includes('/media')) return 'Image Brander';
        if (pathname.includes('/calendar')) return 'Content Calendar';
        if (pathname.includes('/settings')) return 'Settings';
        return 'Social Media Hub';
    };

    return (
        <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
                <h1 className="font-display text-xl font-bold text-foreground">
                    {getTitle()}
                </h1>

            </div>
        </header>
    );
}
