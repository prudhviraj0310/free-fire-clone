"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { TournamentCard } from "@/components/TournamentCard";
import { AppHeader } from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Home() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchTournaments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/tournaments`);
      if (res.data.length === 0) {
        // Auto-seed for demo if empty
        await axios.get(`${baseUrl}/seed`);
        const seededRes = await axios.get(`${baseUrl}/tournaments`);
        setTournaments(seededRes.data);
      } else {
        setTournaments(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tournaments");
    } finally {
      // Fake delay to show off beautiful skeleton (optional but feels premium)
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleJoin = async (id: string) => {
    if (!user) return alert("Please login");
    const tournament = tournaments.find(t => t._id === id);
    if (!tournament) return;
    if (user.walletBalance < tournament.entryFee) return alert("Insufficient Balance");
    if (!confirm(`Join for ₹${tournament.entryFee}?`)) return;

    setJoiningId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${baseUrl}/tournaments/${id}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Success! Room details will appear 15m before match.");
      fetchTournaments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed");
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = tournaments.filter(t => filter === "All" || t.type === filter);

  return (
    <main className="min-h-screen bg-[#09090b] pb-24">
      {/* Premium Glass Header */}
      <AppHeader />

      <div className="container mx-auto px-4 pt-4">

        {/* Chips Filter */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-2">
          {["All", "Solo", "Duo", "Squad"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 touch-manipulation border relative overflow-hidden",
                filter === f
                  ? "bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20"
                  : "bg-[#18181b] text-gray-400 border-[#27272a] hover:border-gray-500"
              )}
            >
              {filter === f && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-white/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">MadGamers</h2>
          <p className="text-xs text-gray-500">Compete in daily custom rooms.</p>
        </div>

        {/* Skeleton Loading or Content */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Render 3 Skeletons
              [1, 2, 3].map((i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-64 rounded-xl border border-[#27272a] bg-[#18181b] p-4 flex flex-col gap-4"
                >
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </motion.div>
              ))
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty"
                className="text-gray-500 col-span-full text-center py-20 bg-[#18181b]/50 rounded-lg border border-[#27272a] border-dashed"
              >
                No tournaments active right now.
              </motion.div>
            ) : (
              filtered.map(t => (
                <motion.div
                  layout
                  key={t._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <TournamentCard
                    tournament={t}
                    onJoin={handleJoin}
                    joining={joiningId === t._id}
                    isRegistered={user ? t.registeredPlayers.some((p: any) => p.userId === user._id) : false}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
