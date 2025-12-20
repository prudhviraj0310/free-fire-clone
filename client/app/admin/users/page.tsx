"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, Search, User, Shield, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

export default function UsersPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearch]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminService.getUsers(debouncedSearch);
            setData(Array.isArray(res.users) ? res.users : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor("username", {
            header: "User",
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <User size={14} />
                    </div>
                    <div>
                        <div className="font-bold text-white">{info.getValue()}</div>
                        <div className="text-xs text-zinc-500">{info.row.original.email}</div>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor("phone", {
            header: "Phone",
            cell: info => <span className="font-mono text-zinc-400">{info.getValue()}</span>
        }),
        columnHelper.accessor("walletBalance", {
            header: "Wallet",
            cell: info => <span className="text-green-500 font-bold">₹{info.getValue()}</span>
        }),
        columnHelper.accessor("isBanned", {
            header: "Status",
            cell: info => info.getValue() ? (
                <span className="bg-red-900/40 text-red-500 px-2 py-1 rounded text-xs font-bold uppercase">BANNED</span>
            ) : (
                <span className="bg-green-900/40 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">ACTIVE</span>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => (
                <Link href={`/admin/users/details?id=${info.row.original._id}`}>
                    <Button size="sm" variant="outline">View</Button>
                </Link>
            )
        })
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">User Management</h2>
                    <p className="text-zinc-400">Search, view, and moderate users.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-6 min-h-[500px]">
                {/* Search Bar */}
                <div className="mb-6 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by username, phone, or email..."
                        className="w-full bg-black border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                    />
                </div>

                {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-white" /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase text-zinc-500 bg-zinc-900/50 border-b border-zinc-800">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-4 font-medium">
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
                                            <td key={cell.id} className="px-6 py-4 text-sm text-zinc-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && <div className="text-center py-12 text-zinc-500">No users found.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
