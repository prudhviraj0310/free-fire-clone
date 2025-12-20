"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export function MobileAdminHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex flex-col bg-zinc-950 border-b border-zinc-800 fixed top-0 left-0 right-0 z-[9999] pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between p-4 h-16">
                <span className="text-lg font-black text-white italic tracking-tighter">
                    FF ARENA <span className="text-red-500">ADMIN</span>
                </span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white hover:bg-zinc-800 rounded-lg"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="fixed inset-0 top-[60px] bg-black/95 z-50 overflow-y-auto pb-20">
                    <div className="p-4">
                        {/* Reusing AdminSidebar content structure logically or importing a simplified version. 
                            Since AdminSidebar is designed as a fixed sidebar, we might need to adjust it or copy the logic.
                            For quick fix, let's wrap AdminSidebar in a way it displays here.
                        */}
                        <div className="block md:hidden">
                            {/* Quick Hack: Render sidebar content here manually or refactor AdminSidebar to accept className overrides. 
                               Refactoring AdminSidebar is cleaner. */}
                            <nav className="flex flex-col gap-2">
                                <AdminSidebar mobile={true} onItemClick={() => setIsOpen(false)} />
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
