"use client";

import { useState } from "react";
import { adminService } from "@/services/adminService";
import { Button } from "@/components/ui/Button";
import { Loader2, Send, Bell } from "lucide-react";

export default function NotificationsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ title: "", body: "" });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!confirm("Send this notification to ALL users?")) return;

        setLoading(true);
        try {
            await adminService.sendBroadcast(formData.title, formData.body);
            alert("Broadcast sent!");
            setFormData({ title: "", body: "" });
        } catch (error: any) {
            alert("Failed to send broadcast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Communications</h2>
                <p className="text-zinc-400">Send push notifications to your player base.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-500/20 p-3 rounded-full text-blue-500">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Broadcast Message</h3>
                        <p className="text-sm text-zinc-500">This will be sent to all users with the app installed.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                        <input
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none"
                            placeholder="e.g. New Tournament Live!"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Message Body</label>
                        <textarea
                            required
                            value={formData.body}
                            onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-[var(--primary)] outline-none h-32"
                            placeholder="e.g. Join the Weekly Solo Cup now. Prizes boosted!"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading} glow>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" size={18} />}
                        Send Broadcast
                    </Button>
                </form>
            </div>
        </div>
    );
}
