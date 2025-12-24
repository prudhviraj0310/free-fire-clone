"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, XCircle, CreditCard, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';

// Use dynamic import for Sheet components if used from shadcn, or build custom dropdown
// For now, building a custom Popover/Dropdown style for simplicity and aesthetic control

export function NotificationList() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const fetchNotifications = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setNotifications(data.data.notifications);
                setUnreadCount(data.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isOpen) fetchNotifications();
        // Poll for unread count every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [isOpen, token]);

    // Initial fetch for badge
    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="text-green-500" size={16} />;
            case 'error': return <XCircle className="text-red-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />;
            case 'transaction': return <CreditCard className="text-blue-500" size={16} />;
            case 'tournament': return <Trophy className="text-purple-500" size={16} />;
            default: return <Info className="text-zinc-400" size={16} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-black animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/20 md:bg-transparent" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-80 md:w-96 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
                                <h3 className="font-bold text-white text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-xs">Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500 text-xs">No notifications yet</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={cn(
                                                    "p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3",
                                                    !n.isRead && "bg-blue-500/5 relative"
                                                )}
                                                onClick={() => markAsRead(n._id)}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                                                )}
                                                <div className="mt-1 flex-shrink-0 bg-zinc-900 p-2 rounded-full border border-white/5 h-fit">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={cn("text-sm font-medium", !n.isRead ? "text-white" : "text-zinc-300")}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-600 font-mono pt-1">
                                                        {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function Separator() { return <div className="h-px bg-white/10 w-full" /> }
