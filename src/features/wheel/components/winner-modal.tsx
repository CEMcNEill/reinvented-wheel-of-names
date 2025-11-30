'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

export function WinnerModal() {
    const { winner, setWinner } = useAppStore();

    const handleClose = useCallback(() => {
        setWinner(null);
    }, [setWinner]);

    useEffect(() => {
        if (winner) {
            // Default confetti colors
            const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                // Oscillate between 25 and 60 degrees
                const now = Date.now();
                const angle = 42.5 + 17.5 * Math.sin(now * 0.005);

                confetti({
                    particleCount: 5,
                    angle: angle,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 180 - angle,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [winner]);

    // Keyboard listener to close modal on Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && winner) {
                e.preventDefault();
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [winner, handleClose]);

    return (
        <Dialog open={!!winner} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md text-center p-12">
                <div className="flex flex-col items-center gap-6">
                    <div className="p-4 bg-primary/10 rounded-full text-primary animate-bounce">
                        <Trophy size={48} />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-muted-foreground">We have a winner!</h2>
                        <p className="text-4xl font-heading font-bold text-foreground break-words">
                            {winner}
                        </p>
                    </div>

                    <Button size="lg" onClick={handleClose} className="mt-4 w-full">
                        Awesome!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
