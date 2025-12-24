"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

/**
 * This component redirects web users to the landing page.
 * Only native app users can access the full app functionality.
 */
export function WebRedirect() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Only allow web users to see the landing page and legal pages
        const allowedWebPaths = ['/', '/legal', '/download'];
        const isAllowedPath = allowedWebPaths.some(p =>
            pathname === p || pathname?.startsWith('/legal')
        );

        // If NOT native and NOT on allowed path, redirect to landing
        if (!Capacitor.isNativePlatform() && !isAllowedPath) {
            router.replace('/');
        }
    }, [pathname, router]);

    return null;
}
