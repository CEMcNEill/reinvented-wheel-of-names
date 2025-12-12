'use client';

import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { usePostHog } from 'posthog-js/react';
import { useAppStore } from '@/lib/store';
import { useTeams } from '@/features/teams/hooks';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './winner-modal.module.css';

export function WinnerModal() {
    const { winner, setWinner, activeTeamId, mode } = useAppStore();
    const { teams } = useTeams();
    const posthog = usePostHog();
    const isDeathMode = posthog.isFeatureEnabled('death_mode');

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
            <DialogContent className={cn(
                styles['winner-modal__content'],
                isDeathMode && styles['winner-modal__content--death-mode']
            )}>

                {/* Content Container */}
                <div className={styles['winner-modal__container']}>
                    <div className={cn(
                        styles['winner-modal__icon-wrapper'],
                        isDeathMode && styles['winner-modal__icon-wrapper--death-mode']
                    )}>
                        {isDeathMode ? <Skull className="w-8 h-8 sm:w-12 sm:h-12" /> : <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />}
                    </div>

                    <div className={styles['winner-modal__title-group']}>
                        <h2 className={cn(
                            styles['winner-modal__title'],
                            isDeathMode && styles['winner-modal__title--death-mode']
                        )}>
                            {isDeathMode ? 'THE CHOSEN ONE' : 'We have a winner!'}
                        </h2>
                        {isDeathMode && !winner?.includes('Sean') && (
                            <div className={styles['winner-modal__avatar-placeholder']}>
                                {/* Placeholder for Avatar if real avatars aren't available yet */}
                                <User className="w-12 h-12" />
                            </div>
                        )}
                        <div className="flex flex-col items-center">
                            <p className={cn(
                                styles['winner-modal__winner-name'],
                                isDeathMode && styles['winner-modal__winner-name--death-mode']
                            )}>
                                {winner}
                            </p>
                            {isDeathMode && teamName && (
                                <p className={styles['winner-modal__team-name']}>{teamName}</p>
                            )}
                        </div>
                        {isDeathMode && (
                            <p className={styles['winner-modal__flavour-text']}>
                                You have been chosen for the pipeline review sacrifice! 🔥
                            </p>
                        )}
                    </div>

                    <Button
                        size="lg"
                        onClick={handleClose}
                        className={cn(
                            styles['winner-modal__action'],
                            isDeathMode && styles['winner-modal__action--death-mode']
                        )}
                    >
                        {isDeathMode ? 'Accept Fate' : 'Awesome!'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
