"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, Check, X, Search, FileText, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

// --- TABS COMPONENT ---
const Tabs = ({ active, onChange }: { active: string; onChange: (v: string) => void }) => (
    <div className="flex gap-2 border-b border-zinc-800 mb-6">
        {['deposits', 'withdrawals', 'revenue'].map((tab) => (
            <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${active === tab
                    ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                    : "text-zinc-500 hover:text-white"
                    }`}
            >
                {tab}
            </button>
        ))}
    </div>
);

// --- MAIN PAGE ---
export default function FinancePage() {
    const [activeTab, setActiveTab] = useState("deposits");

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Finance Center</h2>
                <p className="text-zinc-400">Manage deposits, withdrawals, and track revenue.</p>
            </div>

            <Tabs active={activeTab} onChange={setActiveTab} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 min-h-[500px]">
                {activeTab === "deposits" && <DepositsTable />}
                {activeTab === "withdrawals" && <WithdrawalsTable />}
                {activeTab === "revenue" && <RevenueView />}
            </div>
        </div>
    );
}

// --- DEPOSITS TABLE ---
function DepositsTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPendingDeposits();
            setData(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const note = prompt(action === 'reject' ? "Enter rejection reason (Required):" : "Enter approval note (Optional):");
        if (action === 'reject' && !note) return; // Rejection requires reason

        if (!confirm(`Are you sure you want to ${action} this deposit?`)) return;
        try {
            await adminService.handleDeposit(id, action, note || undefined);
            fetchData(); // Refresh
        } catch (e) {
            alert("Action failed");
        }
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor("paymentId", {
            header: "UTR / Transaction ID",
            cell: info => <span className="font-mono text-xs">{info.getValue()?.split('-')[1] || info.getValue()}</span>
        }),
        columnHelper.accessor("userId.username", {
            header: "User",
        }),
        columnHelper.accessor("amount", {
            header: "Amount",
            cell: info => <span className="text-green-500 font-bold">₹{info.getValue()}</span>
        }),
        columnHelper.accessor("createdAt", {
            header: "Date",
            cell: info => <span className="text-xs text-zinc-500">{format(new Date(info.getValue()), 'dd MMM, HH:mm')}</span>
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: info => (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAction(info.row.original._id, 'approve')} className="bg-green-600 hover:bg-green-700 h-8 px-3 gap-1">
                        <Check size={14} /> <span className="hidden sm:inline">Approve</span>
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleAction(info.row.original._id, 'reject')} className="h-8 px-3 gap-1">
                        <X size={14} /> <span className="hidden sm:inline">Reject</span>
                    </Button>
                </div>
            )
        })
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2"><ArrowDownLeft size={18} className="text-green-500" /> Pending Deposits</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                        value={globalFilter ?? ""}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search UTR or User..."
                        className="bg-black/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-[var(--primary)] outline-none"
                    />
                </div>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">No pending deposits</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-zinc-500 bg-zinc-900/50 border-b border-zinc-800">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-4 py-3 font-medium">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3 text-sm text-zinc-300">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- WITHDRAWALS TABLE ---
function WithdrawalsTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminService.getPendingWithdrawals();
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        const reason = action === 'reject' ? prompt("Enter rejection reason:") : undefined;
        if (action === 'reject' && !reason) return; // Cancelled

        if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;

        try {
            await adminService.handleWithdrawal(id, action, reason || undefined);
            fetchData();
        } catch (e) {
            alert("Action failed");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2"><ArrowUpRight size={18} className="text-red-500" /> Pending Withdrawals</h3>
            </div>

            {loading ? <Loader2 className="animate-spin mx-auto mt-10" /> : data.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">No pending withdrawals</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-zinc-500 bg-zinc-900/50 border-b border-zinc-800">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">UPI ID</th>
                                <th className="px-4 py-3">Wallet Bal</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {data.map((row: any) => (
                                <tr key={row._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-sm text-zinc-300">
                                        <div className="font-bold text-white">{row.userId?.username || 'Unknown'}</div>
                                        <div className="text-xs text-zinc-500">{row.userId?.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-red-500">₹{row.amount}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-zinc-400">{row.upiId}</td>
                                    <td className="px-4 py-3 text-sm text-zinc-400">₹{row.userId?.walletBalance}</td>
                                    <td className="px-4 py-3 text-xs text-zinc-500">{format(new Date(row.createdAt || row.requestedAt), 'dd MMM, HH:mm')}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAction(row._id, 'approve')} className="bg-green-600 hover:bg-green-700 h-8 px-3">
                                                <Check size={14} />
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleAction(row._id, 'reject')} className="h-8 px-3">
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// --- REVENUE VIEW ---
function RevenueView() {
    return (
        <div className="text-center py-20">
            <div className="bg-zinc-800/50 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText size={40} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white">Revenue Reports Coming Soon</h3>
            <p className="text-zinc-500 mt-2">Detailed visualization with charts (Recharts) will be implemented in the next sprint.</p>
        </div>
    )
}
