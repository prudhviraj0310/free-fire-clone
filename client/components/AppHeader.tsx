"use client";

import { Bell, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "./ui/Button";

export function AppHeader() {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 py-3 bg-[#09090b]/80 backdrop-blur-md border-b border-[#27272a]">
            <div className="flex items-center gap-2">
                {/* Brand / Logo if needed, or just Title for context */}
                <Link href="/" className="flex items-center gap-1">
                    <span className="text-xl font-black italic tracking-tighter text-white">Mad</span>
                    <span className="text-xl font-black italic tracking-tighter text-green-500">Gamers</span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#09090b]"></span>
                </button>

                {user ? (
                    <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-green-700 p-[1px]">
                        <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center">
                            <User size={16} className="text-green-500" />
                        </div>
                    </Link>
                ) : (
                    <Link href="/login">
                        <Button size="sm" className="h-8 text-xs font-bold rounded-full px-4">
                            LOGIN
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
