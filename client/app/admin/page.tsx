"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import {
    Loader2, Users, Trophy, Wallet, ArrowUpRight,
    AlertCircle, RefreshCw, TrendingUp, Activity,
    Zap, Clock, CheckCircle2, XCircle
} from "lucide-react";
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
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setRefreshing(true);
            const data = await adminService.getStats();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Loading skeleton
    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-zinc-800 rounded-lg"></div>
                    <div className="h-4 w-40 bg-zinc-800/50 rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-36 bg-zinc-800 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center py-20">
            <XCircle className="text-red-500 w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Failed to Load Dashboard</h3>
            <p className="text-zinc-400 mb-4">Unable to fetch statistics from the server.</p>
            <Button onClick={fetchStats}>Try Again</Button>
        </div>
    );

    // Premium KPI Card with gradient and animations
    const KPICard = ({ title, value, subtext, icon: Icon, gradient, delay = 0 }: any) => (
        <div
            className="relative overflow-hidden rounded-2xl p-[1px] group"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Gradient border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

            {/* Card content */}
            <div className="relative bg-zinc-900/90 backdrop-blur-xl rounded-2xl p-6 h-full">
                {/* Glow effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">{title}</p>
                            <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <Icon size={22} className="text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <TrendingUp size={12} className="text-green-500" />
                        <span>{subtext}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Status indicator with pulse animation
    const StatusIndicator = ({ status, label }: { status: 'online' | 'warning' | 'offline', label: string }) => {
        const colors = {
            online: 'bg-green-500',
            warning: 'bg-yellow-500',
            offline: 'bg-red-500'
        };
        const textColors = {
            online: 'text-green-400',
            warning: 'text-yellow-400',
            offline: 'text-red-400'
        };
        const statusText = {
            online: 'Operational',
            warning: 'Degraded',
            offline: 'Offline'
        };

        return (
            <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/50 p-4 rounded-xl text-center hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`}></span>
                    <span className={`font-bold text-sm ${textColors[status]}`}>{statusText[status]}</span>
                </div>
                <div className="text-xs text-zinc-500">{label}</div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header with animated gradient */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse"></div>

                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Zap className="text-yellow-500" size={28} />
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                                Mission Control
                            </h2>
                        </div>
                        <p className="text-zinc-400 flex items-center gap-2">
                            <Activity size={14} className="text-green-500 animate-pulse" />
                            All systems operational • Welcome back, Commander
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchStats}
                        disabled={refreshing}
                        className="gap-2"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Syncing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* KPI Grid with staggered animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={`₹${stats.finance.revenue.total.toLocaleString()}`}
                    subtext={`+₹${stats.finance.revenue.today} today`}
                    icon={Wallet}
                    gradient="from-green-500 to-emerald-600"
                    delay={0}
                />
                <KPICard
                    title="Active Players"
                    value={stats.users.total.toLocaleString()}
                    subtext={`+${stats.users.today} new today`}
                    icon={Users}
                    gradient="from-blue-500 to-cyan-600"
                    delay={100}
                />
                <KPICard
                    title="Active Matches"
                    value={stats.matches.active}
                    subtext="Live or registering"
                    icon={Trophy}
                    gradient="from-yellow-500 to-orange-600"
                    delay={200}
                />
                <KPICard
                    title="Pending Payouts"
                    value={stats.finance.pendingWithdrawals.count}
                    subtext={`₹${stats.finance.pendingWithdrawals.value} value`}
                    icon={ArrowUpRight}
                    gradient="from-red-500 to-pink-600"
                    delay={300}
                />
            </div>

            {/* Action Cards Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending Actions Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={20} />
                        Action Required
                        {(stats.finance.pendingDeposits.count + stats.finance.pendingWithdrawals.count) > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                {stats.finance.pendingDeposits.count + stats.finance.pendingWithdrawals.count}
                            </span>
                        )}
                    </h3>

                    <div className="space-y-3">
                        {stats.finance.pendingDeposits.count > 0 ? (
                            <div className="flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border-l-4 border-orange-500 hover:from-orange-500/20 transition-colors">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Clock size={14} className="text-orange-400" />
                                        Pending Deposits
                                    </h4>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {stats.finance.pendingDeposits.count} requests • ₹{stats.finance.pendingDeposits.value.toLocaleString()} total
                                    </p>
                                </div>
                                <Link href="/admin/finance">
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">Review</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-zinc-500 text-sm p-4 bg-zinc-800/30 rounded-xl">
                                <CheckCircle2 size={18} className="text-green-500" />
                                All deposits processed
                            </div>
                        )}

                        {stats.finance.pendingWithdrawals.count > 0 ? (
                            <div className="flex justify-between items-center bg-gradient-to-r from-red-500/10 to-transparent p-4 rounded-xl border-l-4 border-red-500 hover:from-red-500/20 transition-colors">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <Clock size={14} className="text-red-400" />
                                        Withdrawal Requests
                                    </h4>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {stats.finance.pendingWithdrawals.count} requests • ₹{stats.finance.pendingWithdrawals.value.toLocaleString()} total
                                    </p>
                                </div>
                                <Link href="/admin/finance">
                                    <Button size="sm" variant="danger">Process</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-zinc-500 text-sm p-4 bg-zinc-800/30 rounded-xl">
                                <CheckCircle2 size={18} className="text-green-500" />
                                All withdrawals processed
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status Card */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="text-green-500" size={20} />
                        System Health
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <StatusIndicator status="online" label="MongoDB" />
                        <StatusIndicator status="online" label="Payment Gateway" />
                        <StatusIndicator status="online" label="Push Notifications" />
                        <StatusIndicator status="online" label="API Server" />
                    </div>

                    {/* App Version Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-lg">
                        <span className="text-xs text-zinc-500">Version</span>
                        <span className="text-xs font-bold text-yellow-500">v2.1.0</span>
                        <span className="text-xs text-zinc-500">•</span>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Latest
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
