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
        <div className="pt-[env(safe-area-inset-top)] pb-20 md:pb-0 min-h-screen">
            {children}
        </div>
    );
}
