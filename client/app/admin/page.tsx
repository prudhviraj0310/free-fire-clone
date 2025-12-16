"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "lucide-react"; // Wait, wrong import. Link is next/link
import NextLink from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash } from "lucide-react";

interface Tournament {
    _id: string;
    title: string;
    status: string;
    registeredPlayers: any[];
}

export default function AdminDashboard() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        // Ideally duplicate fetch or shared hook
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        axios.get(`${API_URL}/tournaments?status=`).then(res => setTournaments(res.data));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <NextLink href="/admin/create">
                    <Button className="flex items-center gap-2">
                        <Plus size={20} /> Create Tournament
                    </Button>
                </NextLink>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black text-gray-400">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Players</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {tournaments.map(t => (
                            <tr key={t._id} className="hover:bg-white/5">
                                <td className="p-4">{t.title}</td>
                                <td className="p-4 uppercase text-xs font-bold">{t.status}</td>
                                <td className="p-4">{t.registeredPlayers.length}</td>
                                <td className="p-4 flex gap-2">
                                    <Button size="sm" variant="secondary">
                                        <Edit size={14} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
