'use client';

import { Scale, Info } from 'lucide-react';

export default function CommissionPolicyPage() {
    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8 text-zinc-300">
            <h1 className="text-3xl font-black text-white uppercase flex items-center gap-3">
                <Scale className="text-yellow-500" size={32} />
                Fair Play & Fees
            </h1>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Platform Commission</h2>
                <p>
                    From every tournament pool, the platform retains a small commission (typically 10-20%) to cover server costs,
                    development, and support staff. The remaining <strong className="text-white">80-90% is distributed entirely to the winners</strong>.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-yellow-200 text-sm">
                    <Info size={20} className="shrink-0" />
                    <p>Example: In a ₹100 Entry match with 48 players, the total collection is ₹4,800. If the Prize Pool is ₹4,000, the platform fee is ₹800.</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">No Gambling Policy</h2>
                <p>
                    Survival Battle is a game of skill. Outcome is determined by your gameplay, strategy, and aim—not by luck.
                    Therefore, it is protected under Indian laws as a "Game of Skill" (except in restricted states).
                </p>
            </section>
        </div>
    );
}
