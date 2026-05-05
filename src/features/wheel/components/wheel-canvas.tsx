'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { usePostHog } from 'posthog-js/react';
import { useWheelSegments } from '../hooks';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';

const COLORS = [
    'var(--palette-primary-500)',
    'var(--palette-complementary-500)',
    'var(--palette-analogous-1-500)',
    'var(--palette-analogous-2-500)',
    'var(--palette-triadic-1-500)',
    'var(--palette-triadic-2-500)',
];

const DEATH_COLORS = [
    '#dc2626', // Red 600
    '#b91c1c', // Red 700
    '#991b1b', // Red 800
    '#7f1d1d', // Red 900
    '#450a0a', // Red 950
    '#000000', // Black
];

const HIGHLANDER_COLORS = [
    '#0f172a', // Slate 900 (Dark)
    '#1e293b', // Slate 800 (Sword Metal)
    '#334155', // Slate 700
    '#1e3a8a', // Blue 900 (Deep)
    '#1d4ed8', // Blue 700 (Electric)
    '#3b82f6', // Blue 500 (Lightning)
];

export function WheelCanvas() {
    const { segments } = useWheelSegments();
    const { isSpinning, setIsSpinning, winner, setWinner, spinRequest, resetSpinRequest, helpOpen, isHighlanderMode, removeActiveSegment, resetHighlander, isDeathMode, mode, activeTeamId } = useAppStore();
    const posthog = usePostHog();
    const controls = useAnimation();
    const [rotation, setRotation] = useState(0);

    const spinWheel = useCallback(async () => {
        if (isSpinning || segments.length < 2 || helpOpen) return;

        setIsSpinning(true);
        setWinner(null);

        posthog.capture('wheel_spun', {
            team_id: mode === 'team' ? activeTeamId : null,
            mode,
            member_count: segments.length,
            highlander_mode: isHighlanderMode,
            death_mode: isDeathMode,
        });

        // Calculate random spin
        const minSpins = 3;
        const maxSpins = 6;
        const randomSpins = Math.random() * (maxSpins - minSpins) + minSpins;
        const randomDegree = Math.floor(randomSpins * 360);

        // The final rotation needs to be additive to current rotation to spin smoothly
        const newRotation = rotation + randomDegree;

        await controls.start({
            rotate: newRotation,
            transition: {
                duration: 2, // 2 seconds spin
                ease: [0.2, 0.8, 0.2, 1], // Custom cubic bezier for realistic deceleration
            }
        });

        setRotation(newRotation);
        setIsSpinning(false);

        // Calculate winner based on final angle
        // The pointer is at 3 o'clock (0 degrees in standard math).
        // The wheel segments start at 12 o'clock (due to -90deg SVG rotation).
        // So there is a 90 degree offset.
        // We calculate the angle of the pointer relative to the wheel's start.
        // Relative Angle = Pointer Angle (90deg) - Wheel Rotation

        const segmentAngle = 360 / segments.length;
        const winningAngle = (90 - (newRotation % 360) + 360) % 360;
        const winningIndex = Math.floor(winningAngle / segmentAngle);

        const winner = segments[winningIndex];
        if (winner) {
            setWinner(winner.text);
            if (isHighlanderMode) {
                removeActiveSegment(winner.id, winner.text);
            }
        }
    }, [isSpinning, segments, rotation, controls, setIsSpinning, setWinner, helpOpen, isHighlanderMode, removeActiveSegment, isDeathMode, mode, activeTeamId, posthog]);

    // Listen for external spin requests
    useEffect(() => {
        if (spinRequest > 0) {
            // Use setTimeout to avoid synchronous state update warning
            setTimeout(() => {
                spinWheel();
                resetSpinRequest();
            }, 0);
        }
    }, [spinRequest, spinWheel, resetSpinRequest]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (winner || helpOpen) return;

                // Don't spin if user is typing in an input or textarea
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                    return;
                }

                spinWheel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [spinWheel, winner, helpOpen]);

    const showHighlanderVictory = isHighlanderMode && segments.length === 1;

    // Highlander victory confetti
    useEffect(() => {
        if (showHighlanderVictory) {
            const duration = 3000;
            const end = Date.now() + duration;
            // Highlander colors: Blue lightning, silver, white unless Death Mode is active
            const colors = isDeathMode 
                ? ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#000000', '#450a0a']
                : ['#3b82f6', '#1d4ed8', '#93c5fd', '#ffffff', '#94a3b8'];

            const frame = () => {
                const now = Date.now();
                const angle = 42.5 + 17.5 * Math.sin(now * 0.005);
                
                const config: confetti.Options = {
                    particleCount: 8,
                    angle: angle,
                    spread: 60,
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
    }, [showHighlanderVictory]);

    if (segments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg">Add names to spin!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-8 py-8 w-full">
            {showHighlanderVictory && (
                <div className={`text-4xl font-bold animate-pulse font-[family-name:var(--font-highlander)] text-center leading-relaxed ${isDeathMode ? 'text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]'}`}>
                    THERE CAN BE ONLY ONE!<br/>
                    <span className={`text-white text-5xl underline underline-offset-8 ${isDeathMode ? 'decoration-red-500' : 'decoration-blue-500'}`}>{segments[0].text}</span><br/>
                    IS THE HIGHLANDER!
                </div>
            )}
            
            {!showHighlanderVictory && (
                <div className="relative w-full max-w-[400px] aspect-square">
                    {/* Pointer - positioned at right (3 o'clock), pointing left (inward) */}
                    <div className="absolute top-1/2 -right-4 w-0 h-0 border-y-[15px] border-y-transparent border-r-[30px] border-r-foreground -translate-y-1/2 z-10 drop-shadow-lg" />

                    {/* Wheel */}
                <motion.div
                    className="w-full h-full rounded-full border-4 border-border overflow-hidden relative shadow-xl"
                    animate={controls}
                    style={{ rotate: rotation }}
                >
                    {/* SVG Implementation for perfect segments */}
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {segments.map((segment, i) => {
                            const angle = 360 / segments.length;
                            // Calculate path for arc
                            const startAngle = (i * angle) * Math.PI / 180;
                            const endAngle = ((i + 1) * angle) * Math.PI / 180;

                            const x1 = 50 + 50 * Math.cos(startAngle);
                            const y1 = 50 + 50 * Math.sin(startAngle);
                            const x2 = 50 + 50 * Math.cos(endAngle);
                            const y2 = 50 + 50 * Math.sin(endAngle);

                            // Large arc flag
                            const largeArcFlag = angle > 180 ? 1 : 0;

                            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                            
                            const fillColors = isDeathMode ? DEATH_COLORS : (isHighlanderMode ? HIGHLANDER_COLORS : COLORS);

                            return (
                                <g key={segment.id}>
                                    <path d={pathData} fill={fillColors[i % fillColors.length]} stroke="var(--background)" strokeWidth="0.5" />
                                    {/* Text Label - simplified positioning */}
                                    <text
                                        x="50"
                                        y="50"
                                        fill="var(--primary-foreground)"
                                        fontSize="4"
                                        fontWeight="bold"
                                        textAnchor="end"
                                        alignmentBaseline="middle"
                                        transform={`rotate(${(i * angle) + (angle / 2)}, 50, 50) translate(45, 0)`}
                                    >
                                        {segment.text.length > 15 ? segment.text.substring(0, 15) + '...' : segment.text}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </motion.div>
            </div>
            )}

            {showHighlanderVictory ? (
                <Button
                    size="lg"
                    className={`text-xl px-12 py-8 rounded-full shadow-lg hover:scale-105 transition-transform ${isDeathMode ? 'bg-red-900 hover:bg-red-800 text-white border-2 border-red-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    onClick={resetHighlander}
                >
                    RESET!
                </Button>
            ) : (
                <Button
                    size="lg"
                    className={`text-xl px-12 py-8 rounded-full shadow-lg hover:scale-105 transition-transform ${isDeathMode ? 'bg-red-900 hover:bg-red-800 text-white border-2 border-red-500' : ''}`}
                    onClick={spinWheel}
                    disabled={isSpinning || segments.length < 2 || helpOpen}
                >
                    {isSpinning ? 'Spinning...' : isDeathMode ? (
                        <span className="flex items-center gap-2">
                            SACRIFICE <Flame className="h-6 w-6 animate-pulse" />
                        </span>
                    ) : 'SPIN!'}
                </Button>
            )}
        </div>
    );
}
