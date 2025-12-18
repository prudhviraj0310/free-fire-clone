'use client';

import { Shield, CheckCircle, HandCoins } from 'lucide-react';

export default function HowWePayPage() {
    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-zinc-300">
            <h1 className="text-3xl font-black text-white uppercase flex items-center gap-3">
                <HandCoins className="text-green-500" size={32} />
                How We Pay
            </h1>

            <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">1. Automated Winnings</h3>
                    <p>
                        As soon as a match result is verified by our admins (usually within 15-30 minutes of match end),
                        prizes are <strong className="text-white">instantly credited</strong> to your in-app wallet.
                    </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">2. Withdrawal Process</h3>
                    <p>
                        You can withdraw your winnings to your UPI ID (GPay, PhonePe, Paytm).
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                            <li>Minimum Withdrawal: ₹50</li>
                            <li>Maximum Daily Limit: ₹2,000</li>
                            <li>Processing Time: 1 - 24 Hours</li>
                        </ul>
                    </p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">3. No Hidden Fees</h3>
                    <p>
                        We do not charge any fee for withdrawals. You get exactly what you earned.
                    </p>
                </div>
            </div>
        </div>
    );
}
