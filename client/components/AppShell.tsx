"use client";

import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";

export function AppShell({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            StatusBar.setStyle({ style: Style.Dark });
            StatusBar.setOverlaysWebView({ overlay: true });
        }
    }, []);

    return (
        <div className="flex flex-col min-h-[100dvh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <main className="flex-1 pb-24 md:pb-0">
                {children}

                {/* Legal & Support Footer */}
                <div className="px-6 py-8 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
                        18+ Skill Gaming • Manual UPI Verification <br /> Withdrawals require approval
                    </p>
                    <a
                        href="https://wa.me/919876543210"
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-500 text-xs font-bold hover:underline"
                    >
                        WhatsApp Support Available
                    </a>
                </div>
            </main>
        </div>
    );
}
