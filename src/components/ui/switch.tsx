'use client';

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./ui-components.module.css";

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
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                styles.switch,
                className
            )}
        >
            <motion.div
                className={styles['switch__thumb']}
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
