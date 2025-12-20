'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { ArrowLeft, Trophy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PrizeTx {
    _id: string;
    amount: number;
    description: string;
    createdAt: string;
    matchId?: string;
    balanceAfter?: number;
}

export default function PrizesPage() {
    const [prizes, setPrizes] = useState<PrizeTx[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPrizes = async () => {
            try {
                const token = localStorage.getItem('token');
                // Could optimize with backend filter, but filtering client-side for MVP
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/wallet/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = Array.isArray(res.data) ? res.data : [];
                const wins = data.filter((tx: any) => tx.type === 'prize_winnings');
                setPrizes(wins);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrizes();
    }, []);

    const handleDispute = async (matchId?: string) => {
        if (!matchId) return alert('No Match ID found for this transaction');

        const claimText = prompt("Please describe the issue (e.g., 'I won but got rank 2 prize')");
        if (!claimText) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
                matchId,
                claimText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Dispute submitted! Support team will review it within 24 hours.');
        } catch (error) {
            console.error(error);
            alert('Failed to submit dispute. Try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 sticky top-0 z-10 p-4 shadow-lg flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black uppercase text-white tracking-wide">Prize Proofs</h1>
                    <p className="text-xs text-amber-100 opacity-90">Verify your winnings & payouts</p>
                </div>
                <Trophy className="text-yellow-200 animate-pulse" size={28} />
            </div>

            <div className="max-w-md mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-zinc-500">Loading prizes...</div>
                ) : prizes.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800 m-4">
                        <Trophy size={48} className="text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-zinc-400">No Winnings Yet</h3>
                        <p className="text-sm text-zinc-600 mt-2">Join tournaments to win prizes!</p>
                        <Button
                            className="mt-6 bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                            onClick={() => router.push('/')}
                        >
                            BROWSE MATCHES
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {prizes.map((tx) => (
                            <div key={tx._id} className="group relative bg-zinc-900 border border-amber-500/20 p-0 rounded-xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all">
                                {/* Ticket Stub Design */}
                                <div className="flex">
                                    {/* Left Side (Amount) */}
                                    <div className="bg-gradient-to-b from-amber-500 to-yellow-600 w-24 flex flex-col items-center justify-center p-2 text-black text-center">
                                        <Trophy size={20} className="mb-1 opacity-80" />
                                        <div className="text-xl font-black leading-tight">₹{tx.amount}</div>
                                        <div className="text-[10px] uppercase font-bold opacity-75">WON</div>
                                    </div>

                                    {/* Right Side (Details) */}
                                    <div className="flex-1 p-3 px-4 flex flex-col justify-center relative bg-black/60 bg-[url('/noise.png')]">
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full"></div>

                                        <div className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">
                                            Prize Ticket
                                        </div>
                                        <div className="text-sm font-medium text-zinc-200 leading-snug mb-2">
                                            {tx.description}
                                        </div>

                                        <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-1">
                                            <div>
                                                <div className="text-[10px] text-zinc-500">Credited At</div>
                                                <div className="text-xs text-zinc-400 font-mono">{format(new Date(tx.createdAt), 'dd MMM, hh:mm a')}</div>
                                            </div>

                                            <button
                                                onClick={() => handleDispute(tx.matchId)}
                                                className="text-[10px] flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-2 py-1 rounded"
                                            >
                                                <AlertTriangle size={10} />
                                                Report Issue
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {/* Receipt Number */}
                                <div className="bg-black text-[10px] text-zinc-600 text-center py-1 font-mono tracking-widest border-t border-white/5">
                                    REF: {tx._id.slice(-8).toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
