"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Wallet, ArrowDownLeft, ArrowUpRight, History, CreditCard } from "lucide-react";

interface Transaction {
    _id: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

export default function WalletPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [amount, setAmount] = useState("");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const fetchTransactions = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/user/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    const handleDeposit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${API_URL}/user/deposit`, { amount: Number(amount) }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Deposit Successful");
            setAmount("");
            fetchTransactions();
            window.location.reload();
        } catch (err) {
            alert("Failed");
        }
    };

    return (
        <div className="min-h-screen pb-24 pt-20 md:pt-24 container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">

                {/* Balance Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--primary)]/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Wallet size={16} /> Total Balance
                        </h2>
                        <div className="text-5xl font-black text-white mb-8 tracking-tighter">
                            ₹{user?.walletBalance || 0}
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-[var(--primary)] focus:outline-none font-mono"
                                    placeholder="Enter Amount"
                                />
                            </div>
                            <Button onClick={handleDeposit} className="w-full" glow>
                                <CreditCard size={18} className="mr-2" /> Add Money
                            </Button>
                            <Button variant="secondary" className="w-full">
                                Withdraw Winnings
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-8 rounded-3xl h-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                            <History size={20} className="text-[var(--primary)]" /> Transaction History
                        </h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {transactions.map((tx, i) => (
                                <div
                                    key={tx._id}
                                    className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors animate-slide-up"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'bg-green-500/20 text-[var(--primary)]' : 'bg-red-500/20 text-red-500'}`}>
                                            {tx.type === 'deposit' || tx.type === 'prize_winnings' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white capitalize">{tx.type.replace('_', ' ')}</div>
                                            <div className="text-xs text-gray-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold text-lg ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'text-[var(--primary)]' : 'text-red-500'}`}>
                                        {tx.type === 'deposit' || tx.type === 'prize_winnings' ? '+' : '-'}₹{tx.amount}
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <History size={48} className="mb-4 opacity-20" />
                                    <p>No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
