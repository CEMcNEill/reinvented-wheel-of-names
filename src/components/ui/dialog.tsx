'use client';

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />
                    {children}
                </div>
            )}
        </AnimatePresence>
    );
}

interface DialogContentProps {
    title?: string;
    children: ReactNode;
    onClose?: () => void;
    className?: string;
}

export function DialogContent({ title, children, onClose, className }: DialogContentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
                "relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden",
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {(title || onClose) && (
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    {title && <h3 className="text-xl font-bold font-heading">{title}</h3>}
                    {onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
            <div className={cn("p-6", !title && !onClose && "p-0")}>
                {children}
            </div>
        </motion.div>
    );
}
