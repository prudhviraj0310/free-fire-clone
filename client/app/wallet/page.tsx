"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Wallet, ArrowDownLeft, ArrowUpRight, History, CreditCard, Loader2 } from "lucide-react";
import Skeleton from '@/components/Skeleton';

// ... imports

interface Transaction {
    _id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
    paymentId?: string;
}

export default function WalletPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/user/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    // ... 

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    const handleInitiateDeposit = async () => {
        const val = Number(amount);
        if (!amount || isNaN(val) || val < 10) {
            alert("Minimum deposit amount is ₹10");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            const confirmLogin = window.confirm("You need to login to add money. Go to login?");
            if (confirmLogin) {
                router.push("/login");
            }
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/wallet/deposit`, {
                amount: Number(amount)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { transactionId } = res.data;
            if (transactionId) {
                router.push(`/pay?id=${transactionId}`);
                setAmount("");
                fetchTransactions();
            } else {
                alert("Failed to initiate transaction. Please try again.");
            }
        } catch (error: any) {
            console.error("Deposit error:", error);
            alert(error.response?.data?.message || "Failed to initiate transaction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 pt-20 md:pt-24 container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Balance Card */}
                {/* Balance Card */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-fit">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Wallet className="text-[var(--primary)]" size={20} />
                        Add Funds
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2 block">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount (e.g. 100)"
                                    className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all font-mono text-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[100, 200, 500].map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(amt.toString())}
                                    className="py-2 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-mono transition-colors"
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <Button onClick={handleInitiateDeposit} className="w-full py-6 text-base" glow disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : <CreditCard size={20} className="mr-2" />}
                            {loading ? "Processing..." : "Add Money"}
                        </Button>

                        <Button
                            onClick={() => router.push('/wallet/withdraw')}
                            className="w-full py-4 text-base bg-red-600 hover:bg-red-700 text-white"
                            variant="secondary"
                        >
                            Withdraw Winnings
                        </Button>
                    </div>
                </div>
                {/* ... */}
                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-8 rounded-3xl h-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <History size={20} className="text-[var(--primary)]" /> Transaction History
                        </h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {transactionsLoading ? (
                                <>
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full opacity-70" />
                                    <Skeleton className="h-20 w-full opacity-40" />
                                </>
                            ) : transactions.map((tx, i) => (
                                <div
                                    key={tx._id}
                                    className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors animate-slide-up"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {/* ... Transaction Item Content ... */}
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'bg-green-500/20 text-[var(--primary)]' : 'bg-red-500/20 text-red-500'}`}>
                                            {tx.type === 'deposit' || tx.type === 'prize_winnings' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white capitalize">{tx.description || tx.type.replace('_', ' ')}</div>
                                            <div className="text-xs text-gray-500 font-mono">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                                {tx.paymentId && <span className="ml-2 opacity-50">#{tx.paymentId.split('-')[1]}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-lg ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'text-[var(--primary)]' : 'text-red-500'}`}>
                                        {tx.type === 'deposit' || tx.type === 'prize_winnings' ? '+' : '-'}₹{tx.amount}
                                    </div>
                                </div>
                            ))}
                            {!transactionsLoading && transactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <History size={48} className="mb-4 opacity-20" />
                                    <p>No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
