"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTournamentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        map: "BERMUDA",
        mode: "SOLO",
        type: "BR",
        entryFee: 0,
        prizePool: 0,
        maxPlayers: 48,
        matchTime: "",
        roomId: "",
        roomPassword: ""
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.createTournament(formData);
            router.push("/admin/matches");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to create tournament");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/matches" className="flex items-center text-zinc-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Matches
            </Link>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <h2 className="text-2xl font-black text-white italic uppercase mb-8">Create Tournament</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Tournament Title</label>
                        <input
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            placeholder="e.g. Daily Bermuda Solo #55"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Map</label>
                            <select
                                name="map"
                                value={formData.map}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            >
                                <option value="BERMUDA">Bermuda</option>
                                <option value="PURGATORY">Purgatory</option>
                                <option value="KALAHARI">Kalahari</option>
                                <option value="ALPINE">Alpine</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Mode</label>
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            >
                                <option value="SOLO">Solo</option>
                                <option value="DUO">Duo</option>
                                <option value="SQUAD">Squad</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Entry Fee (₹)</label>
                            <input
                                type="number"
                                name="entryFee"
                                required
                                min="0"
                                value={formData.entryFee}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Prize Pool (₹)</label>
                            <input
                                type="number"
                                name="prizePool"
                                required
                                min="0"
                                value={formData.prizePool}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Max Players</label>
                            <input
                                type="number"
                                name="maxPlayers"
                                required
                                min="2"
                                value={formData.maxPlayers}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Match Time</label>
                        <input
                            type="datetime-local"
                            name="matchTime"
                            required
                            value={formData.matchTime}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                        />
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-white font-bold mb-4">Room Details (Optional)</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Room ID</label>
                                <input
                                    name="roomId"
                                    value={formData.roomId}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                    placeholder="Pending..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
                                <input
                                    name="roomPassword"
                                    value={formData.roomPassword}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                                    placeholder="Pending..."
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading} glow>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        Create Tournament
                    </Button>
                </form>
            </div>
        </div>
    );
}
