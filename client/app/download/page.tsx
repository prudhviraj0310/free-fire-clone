"use client";

import { Button } from "@/components/ui/Button";
import { Download, ShieldCheck, Zap, HelpCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black z-0" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-2xl mx-auto"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-green-900/30 text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/30 mb-6">
                        Official Release v1.0
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                        MadGamers
                    </h1>
                    <p className="text-xl text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
                        The ultimate esports platform. Compete in daily tournaments, kill enemies, and <span className="text-white font-bold">withdraw real cash</span> instantly.
                    </p>

                    <a href="/madgamers.apk" download>
                        <Button className="h-16 px-10 text-xl bg-green-600 hover:bg-green-500 text-black font-black shadow-[0_0_40px_-10px_rgba(34,197,94,0.6)] hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.8)] transition-all scale-100 hover:scale-105 active:scale-95">
                            <Download className="mr-3" strokeWidth={3} />
                            DOWNLOAD APK
                        </Button>
                    </a>
                    <p className="mt-4 text-xs text-zinc-600 font-mono">Size: 15MB • Android 8.0+</p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6 bg-zinc-900/30 border-y border-zinc-800">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" size={32} />}
                        title="Instant Withdrawals"
                        desc="Get your winnings directly to your UPI ID within minutes. No waiting functionality."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="text-green-400" size={32} />}
                        title="100% Secure"
                        desc="Advanced fraud detection and secure payment gateways ensure your money is safe."
                    />
                    <FeatureCard
                        icon={<HelpCircle className="text-blue-400" size={32} />}
                        title="24/7 Support"
                        desc="Facing an issue? Chat with our support team anytime via WhatsApp directly from the app."
                    />
                </div>
            </section>

            {/* Installation Guide */}
            <section className="py-20 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-black text-center mb-12 italic uppercase">How to Install</h2>
                <div className="space-y-6">
                    <Step
                        num="01"
                        title="Download the File"
                        desc="Click the download button above. You might see a warning 'File might be harmful'—this is standard for downloading APKs outside the Play Store. Click 'Download Anyway'."
                    />
                    <Step
                        num="02"
                        title="Enable Unknown Sources"
                        desc="Open the file. If prompted, go to Settings -> Allow from this source. This gives permission to install our official app."
                    />
                    <Step
                        num="03"
                        title="Install & Login"
                        desc="Click Install. Once done, open the app, login with your phone number, and start winning!"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
                <div className="max-w-2xl mx-auto px-6">
                    <p className="mb-4">
                        &copy; 2024 MadGamers. All rights reserved.
                    </p>
                    <p className="text-xs leading-relaxed max-w-md mx-auto">
                        This game may be habit-forming or financially risky. Play responsibly.
                        Free Fire is a registered trademark of Garena. This platform is not affiliated with Garena.
                        We organize community tournaments.
                    </p>
                    <div className="flex justify-center gap-6 mt-8">
                        <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/legal/refunds" className="hover:text-white transition-colors">Refunds</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="bg-black border border-zinc-800 p-8 rounded-2xl hover:border-zinc-700 transition-colors">
            <div className="mb-6 bg-zinc-900/50 w-16 h-16 rounded-xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <div className="flex gap-6 items-start bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-2xl">
            <span className="text-4xl font-black text-zinc-800 select-none font-mono">{num}</span>
            <div>
                <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
