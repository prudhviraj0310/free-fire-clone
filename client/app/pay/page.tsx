"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from 'qrcode.react';
import axios from "axios";
import { CheckCircle, AlertCircle, Copy, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaymentDetails {
    amount: number;
    status: string;
    upiId: string;
    appName: string;
    message?: string;
}

function PaymentContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [details, setDetails] = useState<PaymentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [utr, setUtr] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        if (!id) return;
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(`${API_URL}/wallet/public/payment/${id}`);
            if (res.data.status !== 'pending') {
                setError(res.data.message || "Transaction is not pending");
            }
            setDetails(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load payment details");
        } finally {
            setLoading(false);
        }
    };

    const submitUTR = async () => {
        if (!utr || utr.length !== 12) {
            alert("Please enter a valid 12-digit UTR");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/wallet/public/payment/submit`, {
                txId: id,
                utr
            });
            setSuccess(true);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit UTR");
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <AlertCircle className="text-red-500 mb-4" size={60} />
                <h1 className="text-2xl font-bold mb-2">Payment Error</h1>
                <p className="text-gray-400 text-center max-w-md">{error}</p>
                <Button className="mt-8" onClick={() => window.close()}>Close Page</Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 animate-in fade-in">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-green-500" size={50} />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-center">Payment Submitted!</h1>
                <p className="text-gray-400 text-center max-w-md mb-8">
                    We have received your UTR <b>{utr}</b>. <br />
                    Please wait for admin approval. Your wallet will be credited shortly.
                </p>
                <div className="space-y-4 w-full max-w-xs">
                    <Button className="w-full" variant="secondary" onClick={() => window.close()}>Close</Button>
                    <p className="text-xs text-center text-gray-600">You can safely close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-[var(--primary)] selection:text-black">
            <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0a] shadow-2xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-[var(--primary)]/20 to-transparent">
                    <h1 className="text-2xl font-black uppercase tracking-wider text-center flex items-center justify-center gap-2">
                        Complete Payment
                    </h1>
                    <div className="mt-8 text-center">
                        <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Total Amount</div>
                        <div className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                            ₹{details?.amount}
                        </div>
                    </div>
                </div>

                {/* QR Section */}
                <div className="px-6 -mt-4 flex-1 flex flex-col gap-6">
                    <div className="bg-white p-4 rounded-3xl shadow-xl mx-auto w-fit rotate-1 hover:rotate-0 transition-transform duration-300">
                        {details && (
                            <QRCodeSVG
                                value={`upi://pay?pa=${details.upiId}&pn=${details.appName}&am=${details.amount}&cu=INR`}
                                size={220}
                                level={"H"}
                            />
                        )}
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-gray-300">Scan with any UPI App</p>
                        <div className="flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <span className="text-xs">GPay • PhonePe • Paytm</span>
                        </div>
                    </div>

                    {/* Manual Copy Section */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center group hover:border-[var(--primary)]/50 transition-colors">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Pay to UPI ID</div>
                            <div className="font-mono text-lg">{details?.upiId}</div>
                        </div>
                        <button onClick={() => copyToClipboard(details?.upiId || "")} className="p-2 bg-white/10 rounded-lg hover:bg-[var(--primary)] hover:text-black transition-colors">
                            <Copy size={18} />
                        </button>
                    </div>

                    {/* UTR Input Section */}
                    <div className="space-y-4 mt-auto mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider">
                                Enter UTR / Reference Number
                            </label>
                            <input
                                type="text"
                                maxLength={12}
                                value={utr}
                                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))} // Only numbers
                                placeholder="12-digit UTR from your UPI App"
                                className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-4 py-4 text-center font-mono text-xl tracking-widest placeholder:tracking-normal focus:border-[var(--primary)] focus:outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 text-center">
                                Usually starts with '4' or '5'. Check your UPI transaction details.
                            </p>
                        </div>

                        <Button
                            className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(255,255,0,0.2)] hover:shadow-[0_0_30px_rgba(255,255,0,0.4)] transition-shadow"
                            glow
                            disabled={submitting || utr.length !== 12}
                            onClick={submitUTR}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : "SUBMIT PAYMENT"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
            <PaymentContent />
        </Suspense>
    );
}
