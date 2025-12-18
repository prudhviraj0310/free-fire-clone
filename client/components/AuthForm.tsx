"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export function AuthForm() {
    const { login, sendOtp, otpSent, googleLogin } = useAuth();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return alert("Invalid Phone Number");
        await sendOtp(phone);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(phone, otp);
    };

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-[#18181b] border border-[#27272a] rounded-lg">
            <h2 className="text-xl font-bold mb-1 text-white">
                {otpSent ? "Verify Code" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
                {otpSent ? "Enter the 6-digit code sent to your phone." : "Enter your mobile number to sign in."}
            </p>

            {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 bg-[#09090b] border border-[#27272a] rounded-md text-white placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
                            placeholder="Mobile Number"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Continue
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-3 bg-[#09090b] border border-[#27272a] rounded-md text-white text-center tracking-widest placeholder-gray-600 focus:border-white focus:outline-none transition-colors"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Verify Login
                    </Button>
                </form>
            )}

            <div className="mt-6 border-t border-[#27272a] pt-4">
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (credentialResponse.credential) {
                                // Decode to get basic info if needed for immediate UI, 
                                // but we send token to backend for verification/decoding
                                // const decoded = jwtDecode(credentialResponse.credential);

                                // For now, pass just the token to our context handler
                                // We might want to decode here to get 'name' or passing it blank and letting server decode
                                const decoded: any = jwtDecode(credentialResponse.credential);
                                await googleLogin(credentialResponse.credential, {
                                    email: decoded.email,
                                    name: decoded.name,
                                    picture: decoded.picture,
                                    googleId: decoded.sub
                                });
                            }
                        }}
                        onError={() => {
                            console.log('Login Failed');
                            alert('Google Login Failed');
                        }}
                        theme="filled_black"
                        shape="rectangular"
                    />
                </div>
            </div>
        </div>
    );
}
