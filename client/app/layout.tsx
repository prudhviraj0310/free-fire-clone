import { GoogleOAuthProvider } from '@react-oauth/google';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Free Fire Tournament Platform",
  description: "Join custom rooms and win prizes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-sans antialiased">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID_FOR_DEV"}>
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
            <Navbar />
            <BottomNav />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html >
  );
}
