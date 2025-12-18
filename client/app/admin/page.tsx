"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import { Loader2, Users, Trophy, Wallet, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface DashboardStats {
    users: { total: number; today: number };
    matches: { active: number };
    finance: {
        pendingDeposits: { count: number; value: number };
        pendingWithdrawals: { count: number; value: number };
        revenue: { total: number; today: number };
    };
}

export default function AdminHome() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>;
    if (!stats) return <div className="text-white">Failed to load stats.</div>;

    const KPICard = ({ title, value, subtext, icon: Icon, color }: any) => (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-500`}>
                        <Icon size={24} />
                    </div>
                </div>
                {subtext && <p className="text-xs text-zinc-500 font-mono">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Mission Control</h2>
                    <p className="text-zinc-400">Welcome back, Commander.</p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={fetchStats}>Refresh Data</Button>
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={`₹${stats.finance.revenue.total.toLocaleString()}`}
                    subtext={`+₹${stats.finance.revenue.today} today`}
                    icon={Wallet}
                    color="green"
                />
                <KPICard
                    title="Active Players"
                    value={stats.users.total.toLocaleString()}
                    subtext={`+${stats.users.today} new users today`}
                    icon={Users}
                    color="blue"
                />
                <KPICard
                    title="Active Matches"
                    value={stats.matches.active}
                    subtext="Live or Open for registration"
                    icon={Trophy}
                    color="yellow"
                />
                <KPICard
                    title="Pending Payouts"
                    value={stats.finance.pendingWithdrawals.count}
                    subtext={`Value: ₹${stats.finance.pendingWithdrawals.value}`}
                    icon={ArrowUpRight}
                    color="red"
                />
            </div>

            {/* ACTION ALERT CENTER */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending Actions */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" /> Pending Actions
                    </h3>

                    <div className="space-y-3">
                        {stats.finance.pendingDeposits.count > 0 ? (
                            <div className="flex justify-between items-center bg-zinc-800 p-4 rounded-xl border-l-4 border-orange-500">
                                <div>
                                    <h4 className="font-bold text-white">Pending Deposits</h4>
                                    <p className="text-xs text-zinc-400">{stats.finance.pendingDeposits.count} requests totaling ₹{stats.finance.pendingDeposits.value}</p>
                                </div>
                                <Link href="/admin/finance">
                                    <Button size="sm">Review</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm">No pending deposits.</div>
                        )}

                        {stats.finance.pendingWithdrawals.count > 0 ? (
                            <div className="flex justify-between items-center bg-zinc-800 p-4 rounded-xl border-l-4 border-red-500">
                                <div>
                                    <h4 className="font-bold text-white">Withdrawal Requests</h4>
                                    <p className="text-xs text-zinc-400">{stats.finance.pendingWithdrawals.count} requests totaling ₹{stats.finance.pendingWithdrawals.value}</p>
                                </div>
                                <Link href="/admin/finance">
                                    <Button size="sm" variant="danger">Review</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-sm">No pending withdrawals.</div>
                        )}
                    </div>
                </div>

                {/* Quick Links / Status */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-xl text-center">
                            <div className="text-green-500 font-bold mb-1">Operational</div>
                            <div className="text-xs text-zinc-500">Database</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl text-center">
                            <div className="text-green-500 font-bold mb-1">Active</div>
                            <div className="text-xs text-zinc-500">Payment Gateway</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl text-center">
                            <div className="text-green-500 font-bold mb-1">Connected</div>
                            <div className="text-xs text-zinc-500">FCM Service</div>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl text-center">
                            <div className="text-yellow-500 font-bold mb-1">v2.1.0</div>
                            <div className="text-xs text-zinc-500">App Version</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
