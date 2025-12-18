'use client';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-zinc-300">
            <h1 className="text-4xl font-black text-white uppercase">Terms of Service</h1>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Eligibility</h2>
                <p>
                    You must be at least 18 years of age to register and participate in tournaments on this platform.
                    Residents of Assam, Odisha, Sikkim, Nagaland, Telangana, and Andhra Pradesh are not permitted to play real money tournaments.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. Account Usage</h2>
                <p>
                    Each user is allowed only one account. Multiple accounts per device are strictly prohibited and will result in an immediate ban.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Fair Play</h2>
                <p>
                    Any use of hacks, mods, or third-party tools in Free Fire matches will lead to disqualification and forfeiture of wallet balance.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">4. Withdrawals</h2>
                <p>
                    Withdrawals are processed within 24-48 hours. Users must complete KYC verification for lifetime withdrawals exceeding ₹5000.
                </p>
            </section>
        </div>
    );
}
