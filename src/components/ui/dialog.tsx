'use client';

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import styles from "./dialog.module.css";

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
                <div className={styles['dialog-overlay']}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className={styles['dialog-overlay__backdrop']}
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
    className?: string; // This will receive 'death_mode_vars' potentially
}

export function DialogContent({ title, children, onClose, className }: DialogContentProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(styles['dialog-content'], className)}
            onClick={(e) => e.stopPropagation()}
        >
            {(title || onClose) && (
                <div className={styles['dialog-header']}>
                    {title && <h3 className={styles['dialog-title']}>{title}</h3>}
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className={styles['dialog-close']}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
            <div className={cn(styles['dialog-body'], !title && !onClose && styles['dialog-body--no-padding'])}>
                {children}
            </div>
        </motion.div>
    );
}
