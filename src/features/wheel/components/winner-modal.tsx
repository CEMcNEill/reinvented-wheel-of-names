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
    const { winner, setWinner, activeTeamId, mode, isHighlanderMode, isDeathMode } = useAppStore();
    const { teams } = useTeams();
    const posthog = usePostHog();

    const activeTeam = mode === 'team' && activeTeamId && teams
        ? teams.find(t => t.id === activeTeamId)
        : null;
    const teamName = activeTeam?.name || '';
    const winnerMember = activeTeam?.members.find(m => m.name === winner);
    const winnerAvatarUrl = winnerMember?.avatarUrl;

    const handleClose = useCallback(() => {
        setWinner(null);
    }, [setWinner]);

    useEffect(() => {
        if (winner) {
            posthog.capture('winner_selected', {
                team_id: mode === 'team' ? activeTeamId : null,
                mode,
                winner_name: winner,
                highlander_mode: isHighlanderMode,
                death_mode: isDeathMode,
            });
        }
    }, [winner, mode, activeTeamId, isHighlanderMode, isDeathMode, posthog]);

    useEffect(() => {
        if (winner && !isHighlanderMode) { // No confetti for eliminations
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

                confetti({ ...config });

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
    }, [winner, isDeathMode, isHighlanderMode]);

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
                {isDeathMode && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-60"
                        >
                            <source src="/fire-confetti.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                )}

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
                            isDeathMode && styles['winner-modal__title--death-mode'],
                            isHighlanderMode && "font-[family-name:var(--font-highlander)] tracking-widest text-4xl sm:text-5xl",
                            isHighlanderMode && (isDeathMode ? "text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" : "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]")
                        )}>
                            {isHighlanderMode ? 'ELIMINATED!' : isDeathMode ? 'THE CHOSEN ONE' : 'We have a winner!'}
                        </h2>

                        <div className={cn(
                            styles['winner-modal__avatar-placeholder'],
                            "overflow-hidden"
                        )}>
                            {winnerAvatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={winnerAvatarUrl}
                                    alt={winner || 'Winner'}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12" />
                            )}
                        </div>
                        <div className="flex flex-col items-center">
                            <p className={cn(
                                styles['winner-modal__winner-name'],
                                isDeathMode && styles['winner-modal__winner-name--death-mode'],
                                isHighlanderMode && "font-[family-name:var(--font-highlander)] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] tracking-wide"
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
                            isDeathMode && styles['winner-modal__action--death-mode'],
                            isHighlanderMode && !isDeathMode && "bg-blue-600 hover:bg-blue-700 text-white",
                            isHighlanderMode && "font-[family-name:var(--font-highlander)] tracking-widest text-lg"
                        )}
                    >
                        {isHighlanderMode ? 'There can be only one!' : isDeathMode ? 'Accept Fate' : 'Awesome!'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
