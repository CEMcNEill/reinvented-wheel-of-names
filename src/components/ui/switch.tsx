'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export function Switch({ checked, onCheckedChange, className }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "w-11 h-6 bg-slate-200 rounded-full p-1 transition-colors cursor-pointer",
                checked && "bg-primary",
                className
            )}
        >
            <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-sm"
                layout
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
                animate={{
                    x: checked ? 20 : 0
                }}
            />
        </button>
    );
}
