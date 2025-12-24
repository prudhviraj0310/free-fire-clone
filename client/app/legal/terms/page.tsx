'use client';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-zinc-300">
            <div className="border-b border-white/10 pb-8">
                <h1 className="text-4xl font-black text-white uppercase mb-2">Terms of Service</h1>
                <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Public Beta Access</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Public Beta Participation</h2>
                <p>
                    By accessing <strong>MadGamers (Public Beta)</strong>, you acknowledge that the platform is in a testing phase.
                    While we strive for stability, you may encounter bugs, glitches, or temporary service interruptions.
                    We reserve the right to reset user data (excluding wallet balances) during major updates if necessary.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. Eligibility & Restricted States</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>You must be at least <strong>18 years of age</strong> to register and participate in cash tournaments.</li>
                    <li>
                        In compliance with Indian state laws, residents of the following states are <strong>strictly prohibited</strong> from participating in paid contests:
                        <span className="text-white font-bold"> Assam, Odisha, Sikkim, Nagaland, Telangana, and Andhra Pradesh.</span>
                    </li>
                    <li>We reserve the right to request location verification at any time.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Wallet & Withdrawals</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Deposits:</strong> Money added to your wallet is for participation in tournaments and cannot be withdrawn directly (Unutilized Winnings).</li>
                    <li><strong>Winnings:</strong> Only "Winnings" are eligible for withdrawal to your UPI account.</li>
                    <li><strong>KYC:</strong> Lifetime withdrawals exceeding ₹5000 require mandatory PAN Card verification.</li>
                    <li><strong>Processing Time:</strong> Withdrawals are typically processed within 24 hours but may take up to 48 hours during beta.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">4. Fair Play & Anti-Cheat</h2>
                <p>
                    We maintain a <strong>Zero Tolerance Policy</strong> towards cheating.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Use of emulators, hacks, mods, scripts, or third-party tools is banned.</li>
                    <li>Teaming up with other players in Solo matches ("Teaming") is strictly prohibited.</li>
                    <li>Any account found violating these rules will be <strong>permanently banned</strong>, and all wallet funds will be forfeited.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">5. Platform Rights</h2>
                <p>
                    MadGamers reserves the right to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Cancel or reschedule tournaments due to technical issues or insufficient participation.</li>
                    <li>Refund entry fees in case of cancelled matches.</li>
                    <li>Suspend accounts suspected of fraudulent activity or terms violation pending investigation.</li>
                </ul>
            </section>

            <section className="pt-8 border-t border-white/10">
                <p className="text-sm text-zinc-500">
                    Last Updated: December 2025 (Beta Release)
                    <br />
                    Contact: help@madgamers.com
                </p>
            </section>
        </div>
    );
}
