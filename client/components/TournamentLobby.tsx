"use client";

import { useEffect, useState } from "react";
import { Users, Clock, Plane, CheckCircle2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
    userId: string;
    inGameName: string;
    slot: number;
}

interface TournamentLobbyProps {
    tournament: {
        _id: string;
        title: string;
        maxPlayers: number;
        players: Player[];
        matchTime: string;
        status: string;
    };
    isRegistered: boolean;
    currentUserId?: string;
}

export function TournamentLobby({ tournament, isRegistered, currentUserId }: TournamentLobbyProps) {
    const [showAnimation, setShowAnimation] = useState(true);
    const playersJoined = tournament.players?.length || 0;
    const spotsLeft = tournament.maxPlayers - playersJoined;
    const progress = (playersJoined / tournament.maxPlayers) * 100;

    // Calculate time until match
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const matchTime = new Date(tournament.matchTime).getTime();
            const diff = matchTime - now;

            if (diff <= 0) {
                setTimeLeft("LIVE NOW");
                return;
            }

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [tournament.matchTime]);

    // Trigger boarding animation when entering
    useEffect(() => {
        if (isRegistered) {
            setShowAnimation(true);
            const timer = setTimeout(() => setShowAnimation(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isRegistered]);

    if (!isRegistered) {
        return null; // Don't show lobby if not registered
    }

    return (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden">
            {/* Header - Flight Board Style */}
            <div className="bg-black/50 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Plane className="text-green-500 animate-pulse" size={20} />
                    <span className="text-xs font-mono text-green-500 uppercase tracking-widest">Boarding Gate</span>
                </div>
                <div className="text-xs font-mono text-yellow-500 flex items-center gap-1">
                    <Clock size={12} />
                    {timeLeft}
                </div>
            </div>

            {/* Boarding Animation */}
            <AnimatePresence>
                {showAnimation && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 0.8 }}
                        >
                            <CheckCircle2 className="w-20 h-20 text-green-500" />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-green-500 font-bold text-xl mt-4"
                        >
                            BOARDING CONFIRMED!
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-zinc-400 text-sm mt-2"
                        >
                            You're in the lobby
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Player Count Display - Airplane Style */}
            <div className="p-4 space-y-4 relative">
                {/* Big Counter */}
                <div className="text-center py-6">
                    <div className="text-6xl font-black text-white mb-2">
                        <span className="text-green-500">{playersJoined}</span>
                        <span className="text-zinc-600 text-4xl">/{tournament.maxPlayers}</span>
                    </div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Players Boarded</p>
                </div>

                {/* Visual Seat Grid */}
                <div className="grid grid-cols-6 gap-1.5">
                    {Array.from({ length: tournament.maxPlayers }).map((_, index) => {
                        const player = tournament.players?.[index];
                        const isCurrentUser = player?.userId === currentUserId;
                        const isFilled = !!player;

                        return (
                            <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all relative group",
                                    isFilled
                                        ? isCurrentUser
                                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                                            : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                                        : "bg-zinc-800/50 border border-zinc-700 border-dashed text-zinc-600"
                                )}
                            >
                                {isFilled ? (
                                    <User size={14} />
                                ) : (
                                    <span className="text-[10px] opacity-50">{index + 1}</span>
                                )}

                                {/* Tooltip for filled seats */}
                                {isFilled && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {player.inGameName || `Player ${player.slot}`}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Status Bar */}
                <div className="space-y-2">
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full",
                                progress >= 100
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : progress >= 70
                                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                            )}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Users size={12} />
                            {spotsLeft > 0 ? `${spotsLeft} seats remaining` : "All seats filled!"}
                        </span>
                        <span className={cn(
                            "font-bold uppercase",
                            progress >= 100 ? "text-green-500" : "text-yellow-500"
                        )}>
                            {progress >= 100 ? "Ready to Fly" : "Boarding"}
                        </span>
                    </div>
                </div>

                {/* Player List */}
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Passengers</p>
                    {tournament.players?.map((player, index) => (
                        <motion.div
                            key={player.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg",
                                player.userId === currentUserId
                                    ? "bg-green-500/10 border border-green-500/30"
                                    : "bg-zinc-800/50"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                player.userId === currentUserId
                                    ? "bg-green-500 text-black"
                                    : "bg-zinc-700 text-white"
                            )}>
                                {player.slot}
                            </div>
                            <div className="flex-1">
                                <p className={cn(
                                    "text-sm font-medium",
                                    player.userId === currentUserId ? "text-green-400" : "text-white"
                                )}>
                                    {player.inGameName || `Player ${player.slot}`}
                                    {player.userId === currentUserId && (
                                        <span className="ml-2 text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded font-bold">YOU</span>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
