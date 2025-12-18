"use client";

import { useEffect, useState, Suspense } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, Shield, Ban, CheckCircle, Wallet, Trophy, History } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

function UserDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            const res = await adminService.getUser(id);
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBanAction = async (action: 'ban' | 'unban') => {
        const promptResult = action === 'ban' ? prompt("Enter reason for ban:") : undefined;
        const reason = promptResult === null ? undefined : promptResult;
        if (action === 'ban' && !reason) return;

        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await adminService.banUser(id as string, action, reason);
            fetchData();
        } catch (e: any) {
            alert("Action failed");
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-white" />;
    if (!data) return <div className="text-white text-center mt-20">User not found</div>;

    const { user, stats, recentTransactions } = data;

    return (
        <div className="max-w-5xl mx-auto">
            <Link href="/admin/users" className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Users
            </Link>

            {/* Header Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 flex justify-between items-start">
                <div className="flex gap-6">
                    <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Shield size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white">{user.username}</h2>
                        <div className="flex gap-4 text-zinc-400 mt-1 font-mono text-sm">
                            <span>{user.phone}</span>
                            <span>•</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            {user.isBanned ? (
                                <span className="bg-red-900/40 text-red-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Ban size={12} /> Banned
                                </span>
                            ) : (
                                <span className="bg-green-900/40 text-green-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle size={12} /> Active
                                </span>
                            )}
                            <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                Role: {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {user.isBanned ? (
                        <Button variant="outline" onClick={() => handleBanAction('unban')}>Unban User</Button>
                    ) : (
                        <Button variant="danger" onClick={() => handleBanAction('ban')}>Ban User</Button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <div className="text-zinc-500 text-sm font-bold uppercase mb-2 flex items-center gap-2">
                        <Wallet size={16} /> Wallet Balance
                    </div>
                    <div className="text-2xl font-black text-green-500">₹{user.walletBalance}</div>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <div className="text-zinc-500 text-sm font-bold uppercase mb-2 flex items-center gap-2">
                        <Trophy size={16} /> Matches Played
                    </div>
                    <div className="text-2xl font-black text-white">{stats.matchesPlayed}</div>
                </div>
                <div className="bg-black/40 border border-zinc-800 p-6 rounded-2xl">
                    <div className="text-zinc-500 text-sm font-bold uppercase mb-2 flex items-center gap-2">
                        <History size={16} /> Total Deposit/Withdraw
                    </div>
                    <div className="text-lg font-mono text-zinc-300">
                        <span className="text-green-500">+₹{stats.totalDeposited}</span> / <span className="text-red-500">-₹{stats.totalWithdrawn}</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {recentTransactions.length === 0 ? (
                        <div className="text-zinc-500 text-center py-8">No transactions found.</div>
                    ) : (
                        recentTransactions.map((tx: any) => (
                            <div key={tx._id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                <div>
                                    <div className="text-white font-bold capitalize">{tx.type.replace('_', ' ')}</div>
                                    <div className="text-xs text-zinc-500 font-mono">{format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}</div>
                                </div>
                                <div className={`font-mono font-bold ${tx.type === 'deposit' || tx.type === 'prize_winnings' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'deposit' || tx.type === 'prize_winnings' ? '+' : '-'}₹{tx.amount}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserDetailsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
            <UserDetailsContent />
        </Suspense>
    );
}
