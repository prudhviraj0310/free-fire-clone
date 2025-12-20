"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import Link from "next/link";
import { Users, Clock, Trophy, MapPin, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tournament {
    _id: string;
    title: string;
    entryFee: number;
    prizePool: number;
    matchTime: string;
    map: string;
    type: string;
    maxPlayers: number;
    registeredPlayers: any[];
    status: string;
}

interface TournamentCardProps {
    tournament: Tournament;
    onJoin: (id: string) => void;
    joining: boolean;
    isRegistered: boolean;
}

export function TournamentCard({ tournament, onJoin, joining, isRegistered }: TournamentCardProps) {
    const spotsLeft = tournament.maxPlayers - tournament.registeredPlayers.length;
    const progress = (tournament.registeredPlayers.length / tournament.maxPlayers) * 100;
    const isFull = spotsLeft === 0;
    const isHot = progress >= 70; // Almost full

    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const matchTime = new Date(tournament.matchTime).getTime();
            const diff = matchTime - now;

            if (diff <= 0) {
                setTimeLeft("LIVE");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) setTimeLeft(`${days}d ${hours}h`);
            else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [tournament.matchTime]);

    // Dynamic gradient based on tournament type
    const gradients: Record<string, string> = {
        'BR': 'from-green-500 to-emerald-600',
        'CS': 'from-blue-500 to-cyan-600',
        'RANKED': 'from-purple-500 to-pink-600',
        'default': 'from-orange-500 to-red-600'
    };
    const gradient = gradients[tournament.type] || gradients.default;

    return (
        <div className="w-full relative group">
            {/* Hot badge */}
            {isHot && !isFull && (
                <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                    <Flame size={10} />
                    HOT
                </div>
            )}

            {/* Card with gradient border on hover */}
            <div className={cn(
                "relative p-[1px] rounded-2xl overflow-hidden transition-all duration-300",
                "hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1"
            )}>
                {/* Gradient border - visible on hover */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    gradient
                )}></div>

                {/* Card content */}
                <div className="relative bg-zinc-900 rounded-2xl overflow-hidden">
                    <Link href={`/tournament?id=${tournament._id}`} className="block">
                        {/* Header Banner */}
                        <div className={cn(
                            "h-28 relative border-b border-zinc-800 p-4 flex flex-col justify-between",
                            "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
                        )}>
                            {/* Decorative glow */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 opacity-20 blur-2xl",
                                `bg-gradient-to-br ${gradient}`
                            )}></div>

                            {/* Top row */}
                            <div className="flex justify-between items-start relative z-10">
                                <span className={cn(
                                    "text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg",
                                    `bg-gradient-to-r ${gradient}`
                                )}>
                                    {tournament.type}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                                    <MapPin size={10} className="text-green-500" />
                                    {tournament.map}
                                </span>
                            </div>

                            {/* Title & Time */}
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate leading-none">
                                    {tournament.title}
                                </h3>
                                <div className="text-[10px] font-mono font-bold mt-1.5 flex items-center gap-1.5">
                                    {timeLeft === "LIVE" ? (
                                        <span className="flex items-center gap-1 text-red-500">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            LIVE NOW
                                        </span>
                                    ) : (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {timeLeft}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Body */}
                        <div className="p-4 space-y-4">
                            {/* Prize & Entry Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-3 text-center hover:border-green-500/30 transition-colors">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Prize Pool</span>
                                    <span className="text-xl font-black text-green-500 flex items-center justify-center gap-1">
                                        <Trophy size={14} />
                                        ₹{tournament.prizePool.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-black/40 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-3 text-center hover:border-zinc-600 transition-colors">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Entry Fee</span>
                                    <span className="text-xl font-black text-white flex items-center justify-center gap-1">
                                        <Zap size={14} className="text-yellow-500" />
                                        ₹{tournament.entryFee}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500 flex items-center gap-1">
                                        <Users size={12} />
                                        Players
                                    </span>
                                    <span className={cn(
                                        "font-bold",
                                        isFull ? "text-red-500" : isHot ? "text-orange-500" : "text-zinc-300"
                                    )}>
                                        {tournament.registeredPlayers.length}/{tournament.maxPlayers}
                                    </span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isFull
                                                ? "bg-red-500"
                                                : isHot
                                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                                    : "bg-gradient-to-r from-green-500 to-emerald-500"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                {!isFull && (
                                    <p className="text-[10px] text-zinc-500 text-center">
                                        {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* Join Button */}
                    <div className="p-4 pt-0">
                        <Button
                            className={cn(
                                "w-full font-bold uppercase tracking-widest text-xs h-11 transition-all",
                                isRegistered
                                    ? "bg-zinc-800 text-zinc-400"
                                    : isFull
                                        ? "bg-zinc-800 text-zinc-500"
                                        : `bg-gradient-to-r ${gradient} hover:shadow-lg hover:shadow-green-500/30`
                            )}
                            disabled={joining || isRegistered || isFull}
                            onClick={(e) => {
                                e.stopPropagation();
                                onJoin(tournament._id);
                            }}
                        >
                            {joining ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Joining...
                                </span>
                            ) : isRegistered ? (
                                "✓ Registered"
                            ) : isFull ? (
                                "Sold Out"
                            ) : (
                                "Join Now"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
