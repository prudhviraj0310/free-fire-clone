"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getDeviceId } from "../utils/device";
import usePushNotifications from "@/hooks/usePushNotifications";

interface User {
    _id: string;
    phone: string;
    role: string;
    walletBalance: number;
    gameUid?: string;
}

interface AuthContextType {
    user: any;
    token: string | null;
    loading: boolean;
    otpSent: boolean;
    sendOtp: (phone: string) => Promise<void>;
    resetOtpState: () => void;
    login: (phone: string, otp: string, freeFireId?: string, inGameName?: string) => Promise<void>;
    googleLogin: (token: string, userInfo: any, freeFireId?: string, inGameName?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
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
        // Hydrate token
        const storedToken = localStorage.getItem('token');
        if (storedToken) setToken(storedToken);

        // Just call /me directly, cookie is handled by browser
        api.get("/auth/me")
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                // If 401, mostly clear session
                if (err.response && err.response.status === 401) {
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const sendOtp = async (phone: string) => {
        await api.post("/auth/send-otp", { phone });
        setOtpSent(true);
    };

    const resetOtpState = () => {
        setOtpSent(false);
    };

    const login = async (phone: string, otp: string, freeFireId?: string, inGameName?: string) => {
        try {
            const res = await api.post("/auth/verify-otp", { phone, otp, freeFireId, inGameName });
            const loggedInUser = res.data.data?.user || res.data.user;

            // Save token to localStorage as backup for admin service
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
            }

            setUser(loggedInUser);

            // Role-based redirect
            if (['admin', 'super_admin', 'match_admin', 'finance_admin'].includes(loggedInUser.role)) {
                router.push('/admin');
            } else {
                router.push('/tournaments');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            throw new Error(message);
        }
    };

    const googleLogin = async (token: string, userInfo: any, freeFireId?: string, inGameName?: string) => {
        try {
            const res = await api.post("/auth/google", {
                token,
                ...userInfo,
                freeFireId,
                inGameName
            });
            const loggedInUser = res.data.data?.user || res.data.user;

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                setToken(res.data.token);
            }

            setUser(loggedInUser);

            // Role-based redirect for Google login too
            if (['admin', 'super_admin', 'match_admin', 'finance_admin'].includes(loggedInUser.role)) {
                router.push('/admin');
            } else {
                router.push('/tournaments');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Google login failed. Please try again.';
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            // Silently handle logout errors
        }
        // Clear all auth state
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    // Initialize Push Notifications
    usePushNotifications(user);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, sendOtp, resetOtpState, otpSent, googleLogin }}>
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
