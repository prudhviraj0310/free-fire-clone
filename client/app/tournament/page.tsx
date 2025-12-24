"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { TournamentLobby } from "@/components/TournamentLobby";
import { Trophy, MapPin, Clock, Users, ArrowLeft, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { MatchVotingModal } from "@/components/MatchVotingModal";

function TournamentDetailsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const { user } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        if (id) {
            fetchTournament();
            // Poll for updates (e.g., status change to VOTING)
            const interval = setInterval(fetchTournament, 5000);
            return () => clearInterval(interval);
        }
    }, [id]);

    const fetchTournament = async () => {
        try {
            const res = await axios.get(`${API_URL}/tournaments/${id}`);
            setTournament(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setJoining(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/tournaments/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTournament(); // Refresh to show lobby
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to join");
        } finally {
            setJoining(false);
        }
    };

    if (!id) return <div className="text-white p-10 text-center">Invalid Tournament ID</div>;
    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="text-green-500 animate-pulse text-xl">Loading...</div>
            </div>
        );
    }
    if (!tournament) return <div className="text-white p-10 text-center">Tournament not found</div>;

    const isRegistered = user && tournament.players?.some((p: any) => p.userId === user._id);
    const spotsLeft = tournament.maxPlayers - (tournament.players?.length || 0);
    const isFull = spotsLeft === 0;
    const isVoting = tournament.status === 'VOTING';

    return (
        <div className="min-h-screen bg-[#09090b] text-white pb-24">
            {/* Voting Modal */}
            <MatchVotingModal
                isOpen={isVoting && isRegistered}
                tournament={tournament}
                currentUserId={user?._id}
                onVoteSubmit={fetchTournament}
            />

            {/* Header */}
            <div className="bg-gradient-to-b from-zinc-800 to-[#09090b] pt-12 pb-8 px-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm">Back</span>
                </button>

                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold px-2 py-1 rounded">
                            {tournament.type}
                        </span>
                        <h1 className="text-2xl font-black mt-2 uppercase italic tracking-tight">
                            {tournament.title}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase">Prize Pool</p>
                        <p className="text-2xl font-black text-green-500">₹{tournament.prizePool?.toLocaleString()}</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4 mt-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-green-500" />
                        {tournament.map}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={12} />
                        {tournament.players?.length || 0}/{tournament.maxPlayers}
                    </span>
                    <span className="flex items-center gap-1">
                        <Zap size={12} className="text-yellow-500" />
                        ₹{tournament.entryFee} Entry
                    </span>
                </div>
            </div>

            <div className="px-4 space-y-6">
                {/* If Registered - Show Lobby */}
                {isRegistered ? (
                    <TournamentLobby
                        tournament={tournament}
                        isRegistered={true}
                        currentUserId={user?._id}
                    />
                ) : (
                    /* Not Registered - Show Join Card */
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl text-center">
                                <p className="text-xs text-zinc-500 uppercase">Entry Fee</p>
                                <p className="text-2xl font-black text-white">₹{tournament.entryFee}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl text-center">
                                <p className="text-xs text-zinc-500 uppercase">Spots Left</p>
                                <p className={cn(
                                    "text-2xl font-black",
                                    isFull ? "text-red-500" : spotsLeft <= 5 ? "text-orange-500" : "text-green-500"
                                )}>
                                    {spotsLeft}
                                </p>
                            </div>
                        </div>

                        <Button
                            className={cn(
                                "w-full h-14 text-lg font-bold uppercase tracking-widest",
                                isFull
                                    ? "bg-zinc-800 text-zinc-500"
                                    : "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30"
                            )}
                            disabled={joining || isFull}
                            onClick={handleJoin}
                        >
                            {joining ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Joining...
                                </span>
                            ) : isFull ? (
                                "Sold Out"
                            ) : (
                                <>Join for ₹{tournament.entryFee}</>
                            )}
                        </Button>

                        <p className="text-xs text-zinc-500 text-center">
                            By joining, you agree to our tournament rules and entry fee will be deducted from your wallet.
                        </p>
                    </div>
                )}

                {/* Room Details Section */}
                {isRegistered && (
                    <div className="bg-zinc-900/50 border border-green-500/20 p-4 rounded-xl">
                        <h3 className="font-bold text-green-500 text-sm mb-2 flex items-center gap-2">
                            <Clock size={16} />
                            Room Details
                        </h3>
                        <p className="text-xs text-zinc-400">
                            Room ID and Password will appear here 15 minutes before match start.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="text-green-500 animate-pulse text-xl">Loading...</div>
            </div>
        }>
            <TournamentDetailsContent />
        </Suspense>
    );
}
