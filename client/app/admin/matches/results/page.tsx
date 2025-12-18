'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { Loader2, Save, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function MatchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [match, setMatch] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Winners State
    const [winners, setWinners] = useState<{ rank: number, userId: string }[]>([
        { rank: 1, userId: '' },
        { rank: 2, userId: '' },
        { rank: 3, userId: '' },
    ]);

    useEffect(() => {
        if (id) loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            const data = await adminService.getMatch(id as string);
            setMatch(data);
            setPlayers(data.players || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (rank: number, userId: string) => {
        setWinners(prev => prev.map(w => w.rank === rank ? { ...w, userId } : w));
    };

    const submitResults = async () => {
        // Filter out empty selections
        const validWinners = winners.filter(w => w.userId);

        if (validWinners.length === 0) {
            alert("Please select at least one winner.");
            return;
        }

        if (!confirm("Are you sure you want to optimize results? This will trigger payouts immediately.")) return;

        setSubmitting(true);
        try {
            await adminService.submitResults(id as string, validWinners);
            alert("Results submitted and prizes credited!");
            router.push(`/admin/matches/details?id=${id}`);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to submit results");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
    if (!match) return <div>Match not found</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Enter Results</h1>
                <p className="text-zinc-400">Select winners for <b>{match.title}</b></p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                {winners.map((winner) => (
                    <div key={winner.rank} className="space-y-2">
                        <label className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                            <Trophy size={16} className={winner.rank === 1 ? 'text-yellow-500' : winner.rank === 2 ? 'text-gray-400' : 'text-orange-700'} />
                            Rank #{winner.rank}
                        </label>
                        <select
                            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-[var(--primary)] outline-none"
                            value={winner.userId}
                            onChange={(e) => handleUserChange(winner.rank, e.target.value)}
                        >
                            <option value="">Select Player...</option>
                            {players.map((p) => (
                                <option key={p.userId._id} value={p.userId._id}>
                                    {p.userId.username} ({p.inGameName})
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                <div className="pt-6 border-t border-zinc-800">
                    <Button
                        className="w-full h-12 text-lg font-bold"
                        glow
                        onClick={submitResults}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : "FINALIZE RESULTS & PAYOUT"}
                    </Button>
                    <p className="text-xs text-center text-zinc-500 mt-4">
                        Action is irreversible. Wallets will be credited immediately.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function MatchResultsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>}>
            <MatchResultsContent />
        </Suspense>
    );
}
