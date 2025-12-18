"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminService.getLogs();
                setLogs(res.logs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <Loader2 className="animate-spin mx-auto mt-20 text-white" />;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Audit Logs</h2>
                <p className="text-zinc-400">Track all administrative actions.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="text-xs uppercase text-zinc-500 bg-zinc-900/50 border-b border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">Target</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {logs.map((log: any) => (
                            <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold font-mono text-zinc-300">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-300">
                                    {log.adminId?.username || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-400">
                                    {log.targetModel} <span className="text-zinc-600">ID: {log.targetId}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-zinc-500 max-w-xs truncate">
                                    {JSON.stringify(log.details)}
                                </td>
                                <td className="px-6 py-4 text-xs text-zinc-500">
                                    {format(new Date(log.createdAt), 'dd MMM, HH:mm')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
