'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { Loader2, Users, Trophy, Gamepad2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function MatchDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            const data = await adminService.getMatch(id as string);
            setMatch(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
    if (!match) return <div>Match not found</div>;

    const canSubmitResults = ['LIVE', 'CONFIRMED'].includes(match.status);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{match.title}</h1>
                    <div className="flex items-center gap-4 text-zinc-400 mt-2">
                        <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">#{match._id}</span>
                        <span className="font-bold text-[var(--primary)]">{match.status}</span>
                        <span>{new Date(match.matchTime).toLocaleString()}</span>
                    </div>
                </div>

                {canSubmitResults && (
                    <Link href={`/admin/matches/results?id=${id}`}>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                            <Trophy size={18} className="mr-2" /> Enter Results
                        </Button>
                    </Link>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4 text-zinc-400">
                        <IndianRupee size={20} />
                        <span className="font-medium">Economics</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span>Entry Fee</span>
                            <span className="font-bold text-white">₹{match.entryFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Prize Pool</span>
                            <span className="font-bold text-green-400">₹{match.prizePool}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Commission</span>
                            <span className="font-bold text-zinc-500">{match.commissionRate}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4 text-zinc-400">
                        <Gamepad2 size={20} />
                        <span className="font-medium">Room Details</span>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 uppercase">Room ID</label>
                            <div className="font-mono text-lg text-white bg-black/50 p-2 rounded border border-zinc-800">
                                {match.roomId || 'Not Set'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 uppercase">Password</label>
                            <div className="font-mono text-lg text-white bg-black/50 p-2 rounded border border-zinc-800">
                                {match.roomPassword || 'Not Set'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    {/* Stats or other info */}
                    <div className="flex items-center gap-3 mb-4 text-zinc-400">
                        <Users size={20} />
                        <span className="font-medium">Participation</span>
                    </div>
                    <div className="text-4xl font-black text-white">
                        {match.players?.length} <span className="text-zinc-600 text-lg">/ {match.maxPlayers}</span>
                    </div>
                    <div className="mt-4 w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-[var(--primary)] h-full"
                            style={{ width: `${(match.players?.length / match.maxPlayers) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Players Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold text-white">Joined Players</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-800 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-4">Slot</th>
                                <th className="p-4">User</th>
                                <th className="p-4">In-Game Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Joined At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {match.players?.map((p: any, idx: number) => (
                                <tr key={idx} className="hover:bg-zinc-800/50">
                                    <td className="p-4 font-mono text-zinc-500">#{p.slot}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-white">{p.userId?.username || 'Unknown'}</div>
                                    </td>
                                    <td className="p-4 text-[var(--primary)] font-medium">
                                        {p.inGameName}
                                    </td>
                                    <td className="p-4 text-sm text-zinc-400">
                                        {p.userId?.phone}
                                    </td>
                                    <td className="p-4 text-sm text-zinc-500">
                                        {new Date(p.joinedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function MatchDetailsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
            <MatchDetailsContent />
        </Suspense>
    );
}
