"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ThumbsUp, ThumbsDown, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import axios from "axios";
import { cn } from "@/lib/utils";

interface VotingModalProps {
    isOpen: boolean;
    tournament: any;
    onVoteSubmit: () => void;
    currentUserId: string;
}

export function MatchVotingModal({ isOpen, tournament, onVoteSubmit, currentUserId }: VotingModalProps) {
    const [voting, setVoting] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [hasVoted, setHasVoted] = useState(false);
    const [myVote, setMyVote] = useState<'YES' | 'NO' | null>(null);

    // Calculate time left for voting
    useEffect(() => {
        if (!tournament?.voting?.deadline) return;

        const calculateTime = () => {
            const now = new Date().getTime();
            const deadline = new Date(tournament.voting.deadline).getTime();
            const diff = deadline - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                return;
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [tournament]);

    // Check if I already voted
    useEffect(() => {
        if (tournament?.voting?.votes) {
            const voteStart = tournament.voting.votes.find((v: any) => v.userId === currentUserId);
            if (voteStart) {
                setHasVoted(true);
                setMyVote(voteStart.vote);
            }
        }
    }, [tournament, currentUserId]);

    const handleVote = async (vote: 'YES' | 'NO') => {
        setVoting(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const token = localStorage.getItem('token');

            await axios.post(`${API_URL}/voting/vote`,
                { tournamentId: tournament._id, vote },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setHasVoted(true);
            setMyVote(vote);
            onVoteSubmit(); // Refresh parent
        } catch (error) {
            console.error('Vote failed:', error);
            alert("Failed to submit vote");
        } finally {
            setVoting(false);
        }
    };

    if (!isOpen) return null;

    const currentPlayers = tournament.players?.length || 0;
    const yesVotes = tournament.voting?.votes?.filter((v: any) => v.vote === 'YES').length || 0;
    const noVotes = tournament.voting?.votes?.filter((v: any) => v.vote === 'NO').length || 0;
    const totalVotes = yesVotes + noVotes;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-900 border border-yellow-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />

                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="text-yellow-500" />
                                Match Decision
                            </h2>
                            <p className="text-zinc-400 text-sm mt-1">
                                Low player count ({currentPlayers}/{tournament.maxPlayers}).
                            </p>
                        </div>
                        <div className="bg-zinc-800 px-3 py-1 rounded-full flex items-center gap-2 text-yellow-500 font-mono text-sm">
                            <Clock size={14} />
                            {timeLeft}
                        </div>
                    </div>

                    {!hasVoted ? (
                        <div className="space-y-4">
                            <p className="text-zinc-300 text-sm">
                                Do you want to start the match with current players or cancel for a full refund?
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleVote('YES')}
                                    disabled={voting}
                                    className="bg-zinc-800 hover:bg-green-500/20 hover:border-green-500 border border-zinc-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <ThumbsUp size={24} className="text-zinc-500 group-hover:text-green-500" />
                                    <span className="font-bold text-white">Start Match</span>
                                    <span className="text-[10px] text-zinc-500">Play with {currentPlayers} players</span>
                                </button>

                                <button
                                    onClick={() => handleVote('NO')}
                                    disabled={voting}
                                    className="bg-zinc-800 hover:bg-red-500/20 hover:border-red-500 border border-zinc-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group"
                                >
                                    <ThumbsDown size={24} className="text-zinc-500 group-hover:text-red-500" />
                                    <span className="font-bold text-white">Cancel</span>
                                    <span className="text-[10px] text-zinc-500">Get Refund</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center py-4">
                            <div className="inline-block p-4 rounded-full bg-zinc-800 border border-zinc-700 relative">
                                {myVote === 'YES' ? (
                                    <ThumbsUp className="text-green-500 w-8 h-8" />
                                ) : (
                                    <ThumbsDown className="text-red-500 w-8 h-8" />
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    YOU
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-bold text-lg">Vote Submitted!</h3>
                                <p className="text-zinc-400 text-sm">Waiting for other players...</p>
                            </div>

                            {/* Live Results Bar */}
                            <div className="relative pt-2">
                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                    <span>Yes ({yesVotes})</span>
                                    <span>No ({noVotes})</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0}%` }}
                                    />
                                    <div
                                        className="h-full bg-red-500 transition-all duration-500"
                                        style={{ width: `${totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                                    {totalVotes}/{currentPlayers} votes cast
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
