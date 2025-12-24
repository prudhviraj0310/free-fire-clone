"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export function BackButtonHandler() {
    const router = useRouter();

    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) return;

        const handleBackButton = App.addListener("backButton", ({ canGoBack }) => {
            if (canGoBack) {
                // Navigate back in the app
                window.history.back();
            } else {
                // If can't go back, minimize the app instead of exiting
                App.minimizeApp();
            }
        });

        return () => {
            handleBackButton.then((listener) => listener.remove());
        };
    }, [router]);

    return null;
}
