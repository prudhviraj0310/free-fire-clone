import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen min-h-screen-safe flex items-center justify-center p-4 pb-8 safe-area-bottom relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-zinc-950">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-yellow-500/10 rounded-full blur-3xl"></div>

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>

            {/* Form */}
            <div className="relative z-10 w-full">
                <AuthForm />
            </div>
        </div>
    );
}
