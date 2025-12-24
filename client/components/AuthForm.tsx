"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Loader2, Phone, KeyRound, Sparkles, Shield, ArrowRight, Gamepad2, User, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { Capacitor } from '@capacitor/core';

export function AuthForm() {
    const { login, sendOtp, otpSent, googleLogin, resetOtpState } = useAuth();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [freeFireId, setFreeFireId] = useState("");
    const [inGameName, setInGameName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    // Check if running in native Capacitor app
    const isNativeApp = Capacitor.isNativePlatform();

    // Resend OTP timer
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);

    // Refs for auto-focus
    const otpInputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (otpSent && resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
    }, [otpSent, resendTimer]);

    // Auto-focus OTP input when OTP is sent
    useEffect(() => {
        if (otpSent && otpInputRef.current) {
            setTimeout(() => otpInputRef.current?.focus(), 100);
        }
    }, [otpSent]);

    // Trigger shake animation on error
    useEffect(() => {
        if (error) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    }, [error]);

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
            setResendTimer(30);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        setError("");
        setLoading(true);
        try {
            await sendOtp(phone);
            setResendTimer(30);
            setCanResend(false);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeNumber = () => {
        resetOtpState();
        setOtp("");
        setError("");
        setTimeout(() => phoneInputRef.current?.focus(), 100);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter the 6-digit code");
            return;
        }
        if (!freeFireId.trim()) {
            setError("Please enter your Game ID");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await login(phone, otp, freeFireId.trim(), inGameName.trim());
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit when OTP is complete (if FF ID is filled and NO error)
    useEffect(() => {
        if (otp.length === 6 && freeFireId.trim() && !loading && !error) {
            // Small delay to show complete OTP before submitting
            const timer = setTimeout(() => {
                const form = document.getElementById('otp-form') as HTMLFormElement;
                if (form) form.requestSubmit();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [otp, freeFireId, loading, error]);

    return (
        <div className="w-full max-w-md mx-auto px-4">
            {/* Glassmorphic Card with Gradient Border */}
            <div className="relative p-[1px] rounded-2xl overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 opacity-50"></div>

                {/* Card content */}
                <div className="relative bg-zinc-900/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500 to-orange-500 opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-500 to-orange-500 opacity-10 blur-3xl"></div>

                    {/* Logo/Brand */}
                    <div className="text-center mb-6 relative z-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 mb-3 shadow-lg shadow-red-500/25">
                            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                            MadGamers
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {otpSent ? "Verify your identity" : "Sign in to continue"}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center ${shake ? 'animate-shake' : ''}`}>
                            {error}
                        </div>
                    )}

                    {/* Phone Number Form */}
                    {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 relative z-10 animate-fade-in">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white text-lg placeholder-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all touch-target"
                                    placeholder="Enter mobile number"
                                    required
                                    disabled={loading}
                                    autoComplete="tel"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-orange-500/25 touch-target"
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
                        <form id="otp-form" onSubmit={handleLogin} className="space-y-4 relative z-10 animate-slide-up">
                            {/* Change Number Button */}
                            <button
                                type="button"
                                onClick={handleChangeNumber}
                                className="flex items-center text-zinc-400 hover:text-white text-sm transition-colors mb-2 touch-target"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Change number
                            </button>

                            {/* OTP Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    ref={otpInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white text-xl sm:text-2xl tracking-[0.4em] text-center placeholder-zinc-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all font-mono otp-input touch-target"
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    autoComplete="one-time-code"
                                />
                            </div>

                            {/* OTP Status & Resend */}
                            <div className="flex items-center justify-between text-sm">
                                <p className="text-zinc-500">
                                    Sent to +91 {phone}
                                </p>
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="flex items-center text-orange-400 hover:text-orange-300 transition-colors touch-target"
                                    >
                                        <RefreshCw size={14} className="mr-1" />
                                        Resend OTP
                                    </button>
                                ) : (
                                    <span className="text-zinc-600">
                                        Resend in {resendTimer}s
                                    </span>
                                )}
                            </div>

                            {/* Free Fire ID Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Gamepad2 size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={freeFireId}
                                    onChange={(e) => {
                                        setFreeFireId(e.target.value);
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all touch-target"
                                    placeholder="Enter Game ID *"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* In-Game Name Field */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="text"
                                    value={inGameName}
                                    onChange={(e) => {
                                        setInGameName(e.target.value);
                                        setError("");
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all touch-target"
                                    placeholder="In-Game Name (optional)"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 touch-target"
                                disabled={loading || otp.length !== 6 || !freeFireId.trim()}
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

                    {/* Google Login - Only show in browser, not in native app */}
                    {!isNativeApp && (
                        <>
                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="px-3 bg-zinc-900 text-zinc-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center relative z-10">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            setLoading(true);
                                            setError("");
                                            try {
                                                const decoded: any = jwtDecode(credentialResponse.credential);
                                                await googleLogin(credentialResponse.credential, {
                                                    email: decoded.email,
                                                    name: decoded.name,
                                                    picture: decoded.picture,
                                                    googleId: decoded.sub
                                                });
                                            } catch (err: any) {
                                                setError(err.response?.data?.message || err.message || "Google login failed");
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
                        </>
                    )}

                    {/* Footer */}
                    <p className="text-center text-zinc-600 text-xs mt-6 px-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
