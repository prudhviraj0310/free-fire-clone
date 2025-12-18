export default function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-zinc-800 rounded-md ${className}`} />
    );
}

export function TournamentSkeleton() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-0 mb-4 h-64">
            <div className="h-32 bg-zinc-800 animate-pulse" />
            <div className="p-4 space-y-3">
                <div className="h-6 w-3/4 bg-zinc-800 animate-pulse rounded" />
                <div className="flex justify-between">
                    <div className="h-4 w-1/4 bg-zinc-800 animate-pulse rounded" />
                    <div className="h-4 w-1/4 bg-zinc-800 animate-pulse rounded" />
                </div>
                <div className="h-10 w-full bg-zinc-800 animate-pulse rounded mt-4" />
            </div>
        </div>
    );
}
