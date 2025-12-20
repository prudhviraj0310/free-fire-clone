"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2, Landmark } from "lucide-react";

export default function WithdrawPage() {
    const router = useRouter();
    const [amount, setAmount] = useState("");
    const [upiId, setUpiId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (Number(amount) < 50) {
            setError("Minimum withdrawal amount is ₹50");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/withdrawal/request`, {
                amount: Number(amount),
                upiId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("Withdrawal request submitted! Admin will process it shortly.");
            setAmount("");
            setUpiId("");
            setTimeout(() => router.push('/wallet'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 px-6 pb-20">
            <div className="max-w-md mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-zinc-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="mr-2" size={20} /> Back
                </button>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Landmark className="text-red-500" />
                        Withdraw Funds
                    </h1>

                    {message && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleWithdraw} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Amount (Min ₹50)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:border-red-500 focus:outline-none transition-colors text-lg font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">UPI ID</label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="username@field"
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl py-4 px-4 text-white placeholder:text-zinc-700 focus:border-red-500 focus:outline-none transition-colors"
                                required
                            />
                            <p className="text-xs text-zinc-600 mt-2">
                                Please double check your UPI ID. We are not responsible for transfers to wrong accounts.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Request Withdrawal"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
