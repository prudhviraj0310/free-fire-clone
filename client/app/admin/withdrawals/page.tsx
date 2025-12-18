'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadWithdrawals();
    }, []);

    const loadWithdrawals = async () => {
        try {
            const data = await adminService.getPendingWithdrawals();
            setWithdrawals(data);
        } catch (error) {
            console.error(error);
            alert('Failed to load withdrawals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const reason = action === 'reject' ? prompt('Rejection reason (optional):') : null;
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this withdrawal?`)) return;

        setProcessing(id);
        try {
            await adminService.handleWithdrawal(id, action, reason || undefined);
            setWithdrawals(prev => prev.filter(w => w._id !== id));
            alert(`Withdrawal ${action}ed successfully`);
        } catch (error: any) {
            alert(error.response?.data?.message || `Failed to ${action}`);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Wallet className="text-[var(--primary)]" />
                    Withdrawals
                </h1>
                <Button variant="outline" onClick={loadWithdrawals}>Refresh</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
            ) : withdrawals.length === 0 ? (
                <div className="bg-zinc-900 rounded-2xl p-10 text-center text-zinc-500">
                    No pending withdrawals found.
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-800 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">UPI ID</th>
                                    <th className="p-4">Balance</th>
                                    <th className="p-4">Requested</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {withdrawals.map((withdrawal) => (
                                    <tr key={withdrawal._id} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{withdrawal.userId?.username || 'Unknown'}</div>
                                            <div className="text-xs text-zinc-500">{withdrawal.userId?.phone}</div>
                                        </td>
                                        <td className="p-4 font-mono text-red-400 font-bold">₹{withdrawal.amount}</td>
                                        <td className="p-4 font-mono text-zinc-300">{withdrawal.upiId}</td>
                                        <td className="p-4 font-mono text-green-400">₹{withdrawal.userId?.walletBalance}</td>
                                        <td className="p-4 text-sm text-zinc-500">
                                            {new Date(withdrawal.requestedAt).toLocaleDateString()}
                                            <div className="text-xs">{new Date(withdrawal.requestedAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleAction(withdrawal._id, 'approve')}
                                                disabled={!!processing}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-bold disabled:opacity-50"
                                            >
                                                {processing === withdrawal._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(withdrawal._id, 'reject')}
                                                disabled={!!processing}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold disabled:opacity-50"
                                            >
                                                {processing === withdrawal._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
