"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CreateTournament() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        entryFee: 50,
        prizePool: 1000,
        prizeDistribution: "1st: 500\n2nd: 300\n3rd: 200",
        matchTime: "",
        map: "Bermuda",
        type: "Solo",
        maxPlayers: 48
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return alert("Not authorized");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            await axios.post(`${API_URL}/tournaments`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Created!");
            router.push("/admin");
        } catch (err) {
            alert("Failed");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-white max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Create Tournament</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input name="title" onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Entry Fee</label>
                        <input name="entryFee" type="number" value={form.entryFee} onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Prize Pool</label>
                        <input name="prizePool" type="number" value={form.prizePool} onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Prize Distribution</label>
                    <textarea name="prizeDistribution" value={form.prizeDistribution} onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white h-24" />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Match Time</label>
                    <input name="matchTime" type="datetime-local" onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Map</label>
                        <select name="map" onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white">
                            <option>Bermuda</option>
                            <option>Purgatory</option>
                            <option>Kalahari</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                        <select name="type" onChange={handleChange} className="w-full bg-black border border-gray-700 p-2 rounded text-white">
                            <option>Solo</option>
                            <option>Duo</option>
                            <option>Squad</option>
                        </select>
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 mt-4">Create Tournament</Button>
            </form>
        </div>
    );
}
