"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none touch-manipulation",
                    {
                        "bg-green-500 text-black border border-transparent shadow-lg shadow-green-500/10": variant === "primary",
                        "bg-[#18181b] border border-[#27272a] text-gray-300 hover:text-white hover:border-gray-500": variant === "secondary",
                        // Outline
                        "bg-transparent border border-green-500/50 text-green-500 hover:bg-green-500/10": variant === "outline",
                        "bg-red-500 text-white hover:bg-red-600": variant === "danger",
                        "h-8 px-3 text-xs": size === "sm",
                        "h-10 px-4 text-sm": size === "md",
                        "h-12 px-6 text-base": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
