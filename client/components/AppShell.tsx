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
            </main>
        </div>
    );
}
