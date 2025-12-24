'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Transaction {
    _id: string;
    type: 'deposit' | 'withdrawal' | 'entry_fee' | 'prize_winnings';
    amount: number;
    status: 'pending' | 'success' | 'failed';
    description: string;
    balanceAfter?: number;
    createdAt: string;
    matchId?: string;
}

export default function StatementPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallet/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTransactions(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'prize_winnings':
                return <ArrowDownLeft className="text-green-500" />;
            case 'withdrawal':
            case 'entry_fee':
                return <ArrowUpRight className="text-red-500" />;
            default:
                return <AlertCircle className="text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-white/10 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-zinc-800 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold uppercase">Account Statement</h1>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-zinc-500">Loading statement...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">No transactions found</div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl relative overflow-hidden">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                            {getIcon(tx.type)}
                                        </div>
                                        <div>
                                            <div className="font-bold capitalize text-sm text-zinc-300">
                                                {tx.type.replace('_', ' ')}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {format(new Date(tx.createdAt), 'dd MMM, hh:mm a')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-right font-mono font-bold ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.type === 'deposit' || tx.type === 'prize_winnings' ? '+' : '-'} ₹{tx.amount}
                                    </div>
                                </div>

                                <div className="text-xs text-zinc-400 bg-black/30 p-2 rounded flex justify-between items-center">
                                    <span>{tx.description}</span>
                                    {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                                        <span className="text-zinc-500 font-mono">
                                            Bal: ₹{tx.balanceAfter}
                                        </span>
                                    )}
                                </div>

                                {tx.status === 'pending' && (
                                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl">
                                        PENDING
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <ShieldCheck size={12} />
                        <span>Secure Ledger &bull; MadGamers Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
