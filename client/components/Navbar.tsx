"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Home, Trophy, User, LogOut, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 h-16 bg-[#09090b]/95 border-b border-[#27272a] backdrop-blur-sm">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-1">
                    <span className="text-white">FF</span>
                    <span className="text-green-500">ARENA</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className={cn("text-sm font-medium hover:text-white transition-colors", pathname === '/' ? "text-white" : "text-gray-400")}
                    >
                        Home
                    </Link>
                    <Link
                        href="/tournaments"
                        className={cn("text-sm font-medium hover:text-white transition-colors", pathname === '/tournaments' ? "text-white" : "text-gray-400")}
                    >
                        Tournaments
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4 pl-4 border-l border-[#27272a]">
                            <Link href="/wallet" className="flex items-center gap-2 text-sm font-medium text-white bg-[#18181b] px-3 py-1.5 rounded-md border border-[#27272a] hover:border-green-500/50 transition-colors">
                                <span className="text-green-500">₹{user.walletBalance}</span>
                            </Link>
                            <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-bold bg-green-500 text-black px-4 py-1.5 rounded-full hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
