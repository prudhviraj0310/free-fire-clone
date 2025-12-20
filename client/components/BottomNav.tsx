"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Hide BottomNav on Admin pages
    if (pathname?.startsWith('/admin')) return null;

    const isAdmin = user && ['admin', 'super_admin', 'match_admin', 'finance_admin'].includes(user.role);

    const tabs = [
        { name: "Home", href: "/", icon: Home },
        { name: "Tournaments", href: "/", icon: Trophy },
        { name: "Wallet", href: "/wallet", icon: Wallet },
        ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: LayoutDashboard }] : []),
        { name: "Account", href: "/profile", icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#09090b]/95 backdrop-blur-md border-t border-[#27272a] z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-full">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-green-500" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
