'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            // console.log("User missing in AdminLayout");
            return;
        }
    }, [user, loading, router]);

    if (loading) return <div>Loading Auth...</div>;

    if (!user) {
        // Redirect if not logged in
        // router.push is handled in useEffect, but we return null to prevent flash
        return null;
    }

    const adminRoles = ['admin', 'super_admin', 'match_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold flex-col gap-4">
                <span className="text-2xl">Access Denied</span>
                <span>Required: Admin</span>
                <span>Your Role: {user.role}</span>
                <span className="text-gray-500 text-sm">Phone: {user.phone}</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 bg-black pl-64">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
