"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Users,
    Trophy,
    FileText,
    Bell,
    LogOut,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const links = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
        { href: '/admin/finance', label: 'Finance', icon: Wallet },
        { href: '/admin/matches', label: 'Matches', icon: Trophy },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/notifications', label: 'Notifications', icon: Bell },
        { href: '/admin/logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <div className="w-64 bg-zinc-950 border-r border-zinc-800/50 h-screen flex flex-col fixed left-0 top-0">
            {/* Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900 to-zinc-950">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-lg font-black text-white italic tracking-tighter">
                        <span className="text-red-500">ADMIN</span>
                    </span>
                </div>
            </div>

            {/* User Info */}
            <div className="px-4 py-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.username || 'Admin'}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                            {user?.role?.replace('_', ' ').toUpperCase() || 'SUPER ADMIN'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest px-3 mb-2">
                    Navigation
                </p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.exact
                        ? pathname === link.href
                        : pathname === link.href || pathname.startsWith(`${link.href}/`);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${isActive
                                    ? 'bg-gradient-to-r from-red-500/20 to-orange-500/10 text-white'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                }`}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full"></div>
                            )}

                            <div className={`p-1.5 rounded-lg transition-colors ${isActive
                                    ? 'bg-gradient-to-br from-red-500/30 to-orange-500/20'
                                    : 'group-hover:bg-zinc-700/50'
                                }`}>
                                <Icon size={16} className={isActive ? 'text-red-400' : ''} />
                            </div>

                            <span className="flex-1">{link.label}</span>

                            {isActive && (
                                <ChevronRight size={14} className="text-zinc-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-zinc-800/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
                >
                    <div className="p-1.5 rounded-lg group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={16} />
                    </div>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
