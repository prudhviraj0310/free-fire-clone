"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Loader2, Phone, KeyRound, Sparkles, Shield, ArrowRight } from "lucide-react";

export function AuthForm() {
    const { login, sendOtp, otpSent, googleLogin } = useAuth();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await sendOtp(phone);
        } catch (err: any) {
            setError(err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter the 6-digit code");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await login(phone, otp);
        } catch (err: any) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Glassmorphic Card with Gradient Border */}
            <div className="relative p-[1px] rounded-2xl overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 opacity-50"></div>

                {/* Card content */}
                <div className="relative bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-8">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-500 opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-500 to-orange-500 opacity-10 blur-3xl"></div>

                    {/* Logo/Brand */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-4 shadow-lg shadow-red-500/25">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                            FF Arena
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {otpSent ? "Verify your identity" : "Sign in to continue"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* Phone Number Form */}
                    {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white text-lg placeholder-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                                    placeholder="Enter mobile number"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-orange-500/25"
                                disabled={loading || phone.length < 10}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        /* OTP Verification Form */
                        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white text-2xl tracking-[0.5em] text-center placeholder-zinc-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all font-mono"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-center text-zinc-500 text-xs">
                                Code sent to +91 {phone}
                            </p>
                            <Button
                                type="submit"
                                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5 mr-2" />
                                        Verify & Login
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-3 bg-zinc-900 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <div className="flex justify-center relative z-10">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                    setLoading(true);
                                    try {
                                        const decoded: any = jwtDecode(credentialResponse.credential);
                                        await googleLogin(credentialResponse.credential, {
                                            email: decoded.email,
                                            name: decoded.name,
                                            picture: decoded.picture,
                                            googleId: decoded.sub
                                        });
                                    } catch (err: any) {
                                        setError(err.message || "Google login failed");
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            onError={() => {
                                setError('Google Login Failed. Please try again.');
                            }}
                            theme="filled_black"
                            shape="rectangular"
                            size="large"
                            width="300"
                        />
                    </div>

                    {/* Footer */}
                    <p className="text-center text-zinc-600 text-xs mt-6">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
