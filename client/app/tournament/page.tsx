"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

function TournamentDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            axios.get(`${API_URL}/tournaments/${id}`)
                .then(res => setTournament(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (!id) return <div className="text-white p-10">Invalid Tournament ID</div>;
    if (loading) return <div className="text-white p-10">Loading Details...</div>;
    if (!tournament) return <div className="text-white p-10">Tournament not found</div>;

    return (
        <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 pb-12">
            <h1 className="text-2xl font-bold mb-4">{tournament.title}</h1>

            <div className="bg-[#18181b] p-6 rounded-xl border border-[#27272a] mb-6">
                {/* Details Content here - Simplified for build fix */}
                <p className="text-gray-400">Map: <span className="text-white">{tournament.map}</span></p>
                <p className="text-gray-400">Prize: <span className="text-green-500">₹{tournament.prizePool}</span></p>
            </div>

            {/* Room Details Section (Only if joined) */}
            <div className="bg-green-900/10 border border-green-500/20 p-6 rounded-xl">
                <h3 className="font-bold text-green-500 mb-2">Room Details</h3>
                <p className="text-sm text-gray-400">
                    Room ID and Password will be displayed here 15 minutes before the match start time.
                </p>
            </div>

            <div className="mt-8">
                <Button onClick={() => window.history.back()} variant="outline">Back</Button>
            </div>
        </div>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={<div className="text-white">Loading...</div>}>
            <TournamentDetailsContent />
        </Suspense>
    );
}
