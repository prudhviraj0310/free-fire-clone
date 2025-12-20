"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Trophy, Calendar, Users, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";

export default function MatchesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminService.getMatches();
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

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this tournament? This cannot be undone.")) return;
        try {
            await adminService.deleteTournament(id);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.message || "Delete failed");
        }
    };

    const columnHelper = createColumnHelper<any>();
    const columns = [
        columnHelper.accessor("title", {
            header: "Tournament",
            cell: info => (
                <div>
                    <div className="font-bold text-white">{info.getValue()}</div>
                    <div className="text-xs text-zinc-500">{info.row.original.map} • {info.row.original.mode}</div>
                </div>
            )
        }),
        columnHelper.accessor("matchTime", {
            header: "Schedule",
            cell: info => (
                <div className="flex items-center gap-1 text-zinc-300">
                    <Calendar size={14} className="text-zinc-500" />
                    {format(new Date(info.getValue()), 'dd MMM, HH:mm')}
                </div>
            )
        }),
        columnHelper.accessor("joined", {
            header: "Players",
            cell: info => <span className={info.getValue() >= info.row.original.maxPlayers ? "text-green-500 font-bold" : ""}>{info.getValue()}/{info.row.original.maxPlayers}</span>
        }),
        columnHelper.accessor("status", {
            header: "Status",
            cell: info => {
                const status = info.getValue();
                let color = "bg-zinc-800 text-zinc-400";
                if (status === 'OPEN') color = "bg-blue-900/40 text-blue-400";
                if (status === 'LIVE') color = "bg-red-900/40 text-red-400 animate-pulse";
                if (status === 'COMPLETED') color = "bg-green-900/40 text-green-400";
                if (status === 'CANCELLED') color = "bg-zinc-800 text-zinc-500 line-through";

                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${color}`}>
                        {status}
                    </span>
                )
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: info => (
                <div className="flex gap-2">
                    <Link href={`/admin/matches/details?id=${info.row.original._id}`}>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-zinc-700">
                            <Edit size={14} />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        variant="danger"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(info.row.original._id)}
                        disabled={info.row.original.joined > 0}
                        title={info.row.original.joined > 0 ? "Cannot delete active tourney" : "Delete"}
                    >
                        <Trash2 size={14} />
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
    });

    if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-white" />;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Tournaments</h2>
                    <p className="text-zinc-400">Manage schedules, players, and results.</p>
                </div>
                <Link href="/admin/matches/create">
                    <Button>
                        <Plus className="mr-2" size={18} />
                        Create New
                    </Button>
                </Link>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
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
                {data.length === 0 && <div className="text-center py-12 text-zinc-500">No tournaments found.</div>}
            </div>
        </div>
    );
}
