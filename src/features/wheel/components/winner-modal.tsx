'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { usePostHog } from 'posthog-js/react';
import { useAppStore } from '@/lib/store';
import { useTeams } from '@/features/teams/hooks';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, User } from 'lucide-react';

export function WinnerModal() {
    const { winner, setWinner, activeTeamId, mode } = useAppStore();
    const { teams } = useTeams();
    const posthog = usePostHog();
    const isDeathMode = posthog.isFeatureEnabled('death-mode');

    // Find team name
    const teamName = mode === 'team' && activeTeamId && teams
        ? teams.find(t => t.id === activeTeamId)?.name
        : '';

    const handleClose = useCallback(() => {
        setWinner(null);
    }, [setWinner]);

    useEffect(() => {
        if (winner) {
            // Default confetti colors
            let colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];

            if (isDeathMode) {
                colors = ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#000000', '#450a0a'];
            }

            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                // Oscillate between 25 and 60 degrees
                const now = Date.now();
                const angle = 42.5 + 17.5 * Math.sin(now * 0.005);

                const config: confetti.Options = {
                    particleCount: 5,
                    angle: angle,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                };

                // Apply death mode specific physics/shapes
                if (isDeathMode) {
                    config.shapes = ['circle'];
                    config.gravity = 2.5; // Heavier, like liquid
                    config.scalar = 1.2;
                    config.drift = 0;
                    config.ticks = 400; // Last longer
                }

                confetti({
                    ...config
                });

                confetti({
                    ...config,
                    angle: 180 - angle,
                    origin: { x: 1 },
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [winner, isDeathMode]);

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
            {/* Reduced opacity to see the background video behind */}
            <DialogContent className={`sm:max-w-md text-center p-12 overflow-hidden relative ${isDeathMode
                    ? 'border-red-900 bg-gradient-to-b from-red-950/70 to-black/70'
                    : 'bg-gradient-to-b from-background/70 to-muted/70 backdrop-blur-md'
                }`}>

                {/* Content Container */}
                <div className="flex flex-col items-center gap-6 relative z-10">
                    <div className={`p-4 rounded-full animate-bounce ${isDeathMode ? 'bg-red-950/50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {isDeathMode ? <Skull size={48} /> : <Trophy size={48} />}
                    </div>

                    <div className="space-y-2">
                        <h2 className={`text-2xl font-semibold ${isDeathMode ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {isDeathMode ? 'THE CHOSEN ONE' : 'We have a winner!'}
                        </h2>
                        {isDeathMode && !winner?.includes('Sean') && (
                            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-gray-500">
                                {/* Placeholder for Avatar if real avatars aren't available yet */}
                                <User size={48} />
                            </div>
                        )}
                        <div className="flex flex-col items-center">
                            <p className={`text-4xl font-heading font-bold break-words ${isDeathMode ? 'text-red-500 drop-shadow-[0_2px_4px_rgba(220,38,38,0.5)]' : 'text-foreground'}`}>
                                {winner}
                            </p>
                            {isDeathMode && teamName && (
                                <p className="text-red-400 text-sm mt-1">{teamName}</p>
                            )}
                        </div>
                        {isDeathMode && (
                            <p className="text-red-200 mt-4 max-w-[200px] mx-auto leading-tight">
                                You have been chosen for the pipeline review sacrifice! 🔥
                            </p>
                        )}
                    </div>

                    <Button
                        size="lg"
                        onClick={handleClose}
                        className={`mt-4 w-full ${isDeathMode ? 'bg-red-900 hover:bg-red-800 text-white' : ''}`}
                    >
                        {isDeathMode ? 'Accept Fate' : 'Awesome!'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
