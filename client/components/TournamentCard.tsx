"use client";

import { Button } from "./ui/Button";
import Link from "next/link";
import { Users, Clock, Trophy, MapPin } from "lucide-react";
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



    // ... inside component ...
    return (
        <div className="w-full bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300 group flex flex-col relative">

            <Link href={`/tournament?id=${tournament._id}`} className="block flex-1">
                {/* Header / Banner Area */}
                <div className="h-24 bg-gradient-to-r from-green-900/20 to-[#09090b] relative border-b border-[#27272a] p-4 flex flex-col justify-between cursor-pointer">
                    <div className="flex justify-between items-start">
                        <span className="bg-green-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-lg shadow-green-500/20">
                            {tournament.type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} className="text-green-500" /> {tournament.map}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate leading-none mt-2">
                        {tournament.title}
                    </h3>
                </div>

                {/* Stats Body */}
                <div className="p-4 bg-[#18181b] flex flex-col gap-4">
                    {/* Prize & Entry Grid */}
                    <div className="grid grid-cols-2 gap-px bg-[#27272a] border border-[#27272a] rounded-lg overflow-hidden">
                        <div className="bg-[#121212] p-3 flex flex-col items-center justify-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Prize Pool</span>
                            <span className="text-lg font-black text-green-500">₹{tournament.prizePool}</span>
                        </div>
                        <div className="bg-[#121212] p-3 flex flex-col items-center justify-center">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Entry</span>
                            <span className="text-lg font-bold text-white">₹{tournament.entryFee}</span>
                        </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex justify-between items-center text-xs font-medium text-gray-400 px-1">
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-green-500" />
                            <span>{new Date(tournament.matchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={isFull ? "text-red-500 font-bold" : "text-gray-300"}>
                            {tournament.registeredPlayers.length}/{tournament.maxPlayers} Players
                        </div>
                    </div>
                </div>
            </Link>

            {/* Actions (Outside Link to prevent hydration mismatch or nested clickable issues usually, but button inside link is bad practice. Kept outside) */}
            <div className="p-4 pt-0 bg-[#18181b]">
                <Button
                    className="w-full font-bold uppercase tracking-widest text-xs h-10 shadow-none hover:shadow-lg hover:shadow-green-500/20 transition-all"
                    variant={isRegistered ? "secondary" : "primary"}
                    disabled={joining || isRegistered || isFull}
                    onClick={(e) => {
                        e.stopPropagation();
                        onJoin(tournament._id);
                    }}
                >
                    {isRegistered ? "Registered" : isFull ? "Full" : "Join Now"}
                </Button>
            </div>
        </div>
    );
}
