'use client';

import { useCallback, useRef } from 'react';
import { driver, type Driver, type DriveStep } from 'driver.js';
import { usePostHog } from 'posthog-js/react';
import { TOUR_STEPS, TOUR_COMPLETED_KEY } from './tour-steps';

export type TourSource = 'auto' | 'manual';

interface StartTourOptions {
    source: TourSource;
}

interface UseTourReturn {
    startTour: (options: StartTourOptions) => void;
    hasCompletedTour: () => boolean;
}

export function useTour(): UseTourReturn {
    const posthog = usePostHog();
    const driverRef = useRef<Driver | null>(null);
    const sourceRef = useRef<TourSource>('auto');
    const startedAtRef = useRef<number>(0);
    const skippedRef = useRef<boolean>(false);
    const lastStepIdRef = useRef<string>('');

    const hasCompletedTour = useCallback(() => {
        if (typeof window === 'undefined') return true;
        return window.localStorage.getItem(TOUR_COMPLETED_KEY) === '1';
    }, []);

    const markCompleted = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOUR_COMPLETED_KEY, '1');
        }
    }, []);

    const startTour = useCallback(({ source }: StartTourOptions) => {
        if (driverRef.current?.isActive()) return;

        sourceRef.current = source;
        startedAtRef.current = Date.now();
        skippedRef.current = false;
        lastStepIdRef.current = TOUR_STEPS[0]?.id ?? '';

        const steps: DriveStep[] = TOUR_STEPS.map((step) => ({
            element: step.selector,
            popover: {
                title: step.title,
                description: step.description,
                side: step.side,
                align: step.align,
            },
        }));

        const instance = driver({
            showProgress: true,
            allowClose: true,
            smoothScroll: true,
            stagePadding: 6,
            stageRadius: 8,
            popoverClass: 'wot-tour-popover',
            nextBtnText: 'Next',
            prevBtnText: 'Back',
            doneBtnText: 'Done',
            steps,
            onHighlightStarted: (_el, step, { driver: d }) => {
                const index = d.getActiveIndex() ?? 0;
                const stepConfig = TOUR_STEPS[index];
                if (!stepConfig) return;
                lastStepIdRef.current = stepConfig.id;
                posthog.capture('product_tour_step_viewed', {
                    step_id: stepConfig.id,
                    step_index: index,
                    total_steps: TOUR_STEPS.length,
                    source: sourceRef.current,
                });
            },
            onCloseClick: (_el, _step, { driver: d }) => {
                skippedRef.current = true;
                const index = d.getActiveIndex() ?? 0;
                const stepConfig = TOUR_STEPS[index];
                posthog.capture('product_tour_skipped', {
                    step_id: stepConfig?.id ?? lastStepIdRef.current,
                    step_index: index,
                    total_steps: TOUR_STEPS.length,
                    source: sourceRef.current,
                });
                d.destroy();
            },
            onDestroyed: () => {
                markCompleted();
                if (!skippedRef.current) {
                    const completedAt = new Date().toISOString();
                    posthog.capture('product_tour_completed', {
                        source: sourceRef.current,
                        duration_ms: Date.now() - startedAtRef.current,
                        total_steps: TOUR_STEPS.length,
                    });
                    posthog.setPersonProperties?.({
                        product_tour_completed_at: completedAt,
                        product_tour_completed_source: sourceRef.current,
                    });
                }
            },
        });

        driverRef.current = instance;

        posthog.capture('product_tour_started', {
            source,
            total_steps: TOUR_STEPS.length,
        });

        instance.drive();
    }, [posthog, markCompleted]);

    return { startTour, hasCompletedTour };
}
