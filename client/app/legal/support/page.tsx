'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SupportPage() {
    return (
        <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-8">
            <h1 className="text-4xl font-black text-white uppercase">Player Support</h1>

            <p className="text-zinc-400 text-lg">
                Need help with a deposit, withdrawal, or match issue? <br />
                Our support team is available 10 AM - 10 PM.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="text-green-500" size={32} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Chat on WhatsApp</h3>
                    <p className="text-zinc-500 text-sm">Fastest response time</p>
                </div>

                <a
                    href="https://wa.me/919876543210?text=I%20need%20help%20with%20Free%20Fire%20App"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <Button glow className="w-full text-lg h-12 font-bold bg-green-600 hover:bg-green-700">
                        OPEN WHATSAPP
                    </Button>
                </a>
            </div>

            <div className="text-zinc-500 text-sm">
                Email: support@freefiretournament.com
            </div>
        </div>
    );
}
