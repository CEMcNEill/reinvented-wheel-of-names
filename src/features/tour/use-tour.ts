'use client';

import { useCallback, useRef } from 'react';
import { driver, type Driver, type DriveStep } from 'driver.js';
import { usePostHog } from 'posthog-js/react';
import { type Tour, tourCompletedKey } from './tour-steps';

export type TourSource = 'auto' | 'manual';

interface StartTourOptions {
    tour: Tour;
    source: TourSource;
}

interface HasCompletedOptions {
    tour: Tour;
}

interface UseTourReturn {
    startTour: (options: StartTourOptions) => void;
    hasCompletedTour: (options: HasCompletedOptions) => boolean;
}

export function useTour(): UseTourReturn {
    const posthog = usePostHog();
    const driverRef = useRef<Driver | null>(null);
    const tourRef = useRef<Tour | null>(null);
    const sourceRef = useRef<TourSource>('auto');
    const startedAtRef = useRef<number>(0);
    const skippedRef = useRef<boolean>(false);
    const lastStepIdRef = useRef<string>('');

    const hasCompletedTour = useCallback(({ tour }: HasCompletedOptions) => {
        if (typeof window === 'undefined') return true;
        return window.localStorage.getItem(tourCompletedKey(tour)) === '1';
    }, []);

    const markCompleted = useCallback((tour: Tour) => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(tourCompletedKey(tour), '1');
        }
    }, []);

    const baseEventProps = (tour: Tour) => ({
        tour_id: tour.id,
        tour_name: tour.name,
        tour_version: tour.version,
        total_steps: tour.steps.length,
        source: sourceRef.current,
    });

    const startTour = useCallback(({ tour, source }: StartTourOptions) => {
        if (driverRef.current?.isActive()) return;

        tourRef.current = tour;
        sourceRef.current = source;
        startedAtRef.current = Date.now();
        skippedRef.current = false;
        lastStepIdRef.current = tour.steps[0]?.id ?? '';

        const steps: DriveStep[] = tour.steps.map((step) => ({
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
            onHighlightStarted: (_el, _step, { driver: d }) => {
                const activeTour = tourRef.current;
                if (!activeTour) return;
                const index = d.getActiveIndex() ?? 0;
                const stepConfig = activeTour.steps[index];
                if (!stepConfig) return;
                lastStepIdRef.current = stepConfig.id;
                posthog.capture('product_tour_step_viewed', {
                    ...baseEventProps(activeTour),
                    step_id: stepConfig.id,
                    step_index: index,
                });
            },
            onCloseClick: (_el, _step, { driver: d }) => {
                const activeTour = tourRef.current;
                if (!activeTour) {
                    d.destroy();
                    return;
                }
                skippedRef.current = true;
                const index = d.getActiveIndex() ?? 0;
                const stepConfig = activeTour.steps[index];
                posthog.capture('product_tour_skipped', {
                    ...baseEventProps(activeTour),
                    step_id: stepConfig?.id ?? lastStepIdRef.current,
                    step_index: index,
                });
                d.destroy();
            },
            onDestroyed: () => {
                const activeTour = tourRef.current;
                if (!activeTour) return;
                markCompleted(activeTour);
                if (!skippedRef.current) {
                    const completedAt = new Date().toISOString();
                    posthog.capture('product_tour_completed', {
                        ...baseEventProps(activeTour),
                        duration_ms: Date.now() - startedAtRef.current,
                    });
                    posthog.setPersonProperties?.({
                        [`tour_${activeTour.id}_completed_at`]: completedAt,
                        [`tour_${activeTour.id}_completed_source`]: sourceRef.current,
                        [`tour_${activeTour.id}_completed_version`]: activeTour.version,
                        last_tour_completed_id: activeTour.id,
                        last_tour_completed_at: completedAt,
                    });
                }
            },
        });

        driverRef.current = instance;

        posthog.capture('product_tour_started', baseEventProps(tour));

        instance.drive();
    }, [posthog, markCompleted]);

    return { startTour, hasCompletedTour };
}
