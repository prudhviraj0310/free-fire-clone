"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    phone: string;
    role: string;
    walletBalance: number;
    gameUid?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (phone: string, otp: string) => Promise<void>;
    logout: () => void;
    sendOtp: (phone: string) => Promise<void>;
    otpSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const router = useRouter();

    // Basic API Instance
    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
                .then((res) => setUser(res.data))
                .catch(() => localStorage.removeItem("token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const sendOtp = async (phone: string) => {
        await api.post("/auth/send-otp", { phone });
        setOtpSent(true);
    };

    const login = async (phone: string, otp: string) => {
        const res = await api.post("/auth/verify-otp", { phone, otp });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, sendOtp, otpSent }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
