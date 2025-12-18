"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../utils/device";

interface User {
    _id: string;
    phone: string;
    role: string;
    walletBalance: number;
    gameUid?: string;
}

interface AuthContextType {
    user: any;
    loading: boolean;
    otpSent: boolean;
    sendOtp: (phone: string) => Promise<void>;
    login: (phone: string, otp: string) => Promise<void>;
    googleLogin: (token: string, userInfo: any) => Promise<void>;
    logout: () => void;
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
        withCredentials: true // Important for cookies
    });

    // Add Device ID to requests
    useEffect(() => {
        const setupInterceptor = async () => {
            const deviceId = await getDeviceId();
            api.interceptors.request.use((config) => {
                config.headers['x-device-id'] = deviceId;
                return config;
            });
        };
        setupInterceptor();
    }, []);

    useEffect(() => {
        // Just call /me directly, cookie is handled by browser
        api.get("/auth/me")
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                // If 401, mostly clear session
                if (err.response && err.response.status === 401) {
                    setUser(null);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const sendOtp = async (phone: string) => {
        await api.post("/auth/send-otp", { phone });
        setOtpSent(true);
    };

    const login = async (phone: string, otp: string) => {
        try {
            const res = await api.post("/auth/verify-otp", { phone, otp });
            // Token is in cookie now
            setUser(res.data.data?.user || res.data.user);
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    };

    const googleLogin = async (token: string, userInfo: any) => {
        try {
            // We verify the token on the server
            const res = await api.post("/auth/google", {
                token,
                ...userInfo
            });
            setUser(res.data.data?.user || res.data.user);
            router.push('/');
        } catch (error) {
            console.error("Google Login Error", error);
            alert("Google Login Failed");
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.error("Logout error", e);
        }
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, sendOtp, otpSent, googleLogin }}>
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
