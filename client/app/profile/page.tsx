'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { User, Trophy, Crosshair, Target, Shield, LogOut, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UserProfile {
    username: string;
    email: string;
    phone: string;
    walletBalance: number;
    gameDetails: {
        inGameName: string;
        freeFireId: string;
        level: number;
        rank: string;
    };
    stats: {
        matchesPlayed: number;
        matchesWon: number;
        totalKills: number;
        earnings: number;
    };
    kycStatus: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return router.push('/login');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data);
            } catch (error) {
                console.error(error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) return <div className="text-white text-center py-20">Loading Profile...</div>;
    if (!profile) return null;

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header / Avatar */}
            <div className="bg-gradient-to-b from-zinc-800 to-black p-6 pt-12 flex flex-col items-center border-b border-zinc-800">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full p-1 mb-4">
                    <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
                        <User size={40} className="text-zinc-400" />
                    </div>
                </div>
                <h1 className="text-2xl font-black uppercase text-white tracking-wider">{profile.username}</h1>
                <p className="text-zinc-500 text-sm font-mono">ID: {profile.gameDetails.freeFireId || 'Not Set'}</p>

                {profile.kycStatus === 'verified' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full">
                        <Shield size={12} /> VERIFIED PLAYER
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Trophy size={16} className="text-yellow-500" /> Matches Won
                        </div>
                        <div className="text-2xl font-black">{profile.stats?.matchesWon || 0}</div>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Crosshair size={16} className="text-red-500" /> Total Kills
                        </div>
                        <div className="text-2xl font-black">{profile.stats?.totalKills || 0}</div>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Target size={16} className="text-blue-500" /> Played
                        </div>
                        <div className="text-2xl font-black">{profile.stats?.matchesPlayed || 0}</div>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Target size={16} className="text-green-500" /> Earnings
                        </div>
                        <div className="text-2xl font-black text-green-400">₹{profile.stats?.earnings || 0}</div>
                    </div>
                </div>

                {/* Game Details */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-white">Game Details</h3>
                        <Button variant="secondary" size="sm" className="text-xs text-yellow-500">
                            <Edit2 size={12} className="mr-1" /> EDIT
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">IGN</span>
                            <span className="font-mono">{profile.gameDetails.inGameName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">UID</span>
                            <span className="font-mono">{profile.gameDetails.freeFireId || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                    <button
                        onClick={() => router.push('/wallet/statement')}
                        className="w-full p-4 text-left border-b border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
                    >
                        Wallet Statement
                    </button>
                    <button
                        onClick={() => router.push('/legal/support')}
                        className="w-full p-4 text-left border-b border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition"
                    >
                        Support & Help
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 text-left text-red-400 hover:bg-zinc-800 transition flex items-center gap-2"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <div className="text-center text-xs text-zinc-600 font-mono">
                    Member since {new Date(profile.createdAt).getFullYear()}
                </div>
            </div>
        </div>
    );
}
