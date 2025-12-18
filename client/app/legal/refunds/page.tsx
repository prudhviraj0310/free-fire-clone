'use client';

export default function RefundPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-zinc-300">
            <h1 className="text-4xl font-black text-white uppercase">Refund Policy</h1>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">1. Tournament Cancellation</h2>
                <p>
                    If a tournament is cancelled by the administrators or does not meet the minimum player requirement,
                    <strong className="text-white"> 100% of the entry fee</strong> will be automatically refunded to your wallet.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">2. User Cancellation</h2>
                <p>
                    Users can leave a tournament up to 15 minutes before the scheduled start time for a full refund.
                    No refunds are provided if you leave within 15 minutes of the start time.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">3. Failed Deposits</h2>
                <p>
                    If money is deducted from your bank but not reflected in your wallet within 1 hour,
                    please contact support with your UTR number for a manual credit or refund.
                </p>
            </section>
        </div>
    );
}
