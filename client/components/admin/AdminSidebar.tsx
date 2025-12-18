"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Users,
    Trophy,
    AlertTriangle,
    FileText,
    Settings,
    Bell,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/finance', label: 'Finance', icon: Wallet },
        { href: '/admin/matches', label: 'Matches', icon: Trophy },
        { href: '/admin/users', label: 'Users & Risk', icon: Users },
        { href: '/admin/notifications', label: 'Communications', icon: Bell },
        { href: '/admin/logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <div className="w-64 bg-[#09090b] border-r border-[#27272a] h-screen flex flex-col fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-[#27272a]">
                <span className="text-xl font-black text-white italic tracking-tighter">
                    <span className="text-red-600">ADMIN</span>PANEL
                </span>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#27272a]">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
}
