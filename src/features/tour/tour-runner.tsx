'use client';

import { useEffect } from 'react';
import { useTour } from './use-tour';
import { MAIN_ONBOARDING_TOUR } from './tour-steps';

export function TourRunner() {
    const { startTour, hasCompletedTour } = useTour();

    useEffect(() => {
        if (hasCompletedTour({ tour: MAIN_ONBOARDING_TOUR })) return;

        const handle = window.setTimeout(() => {
            if (!document.querySelector('[data-tour-id="app-title"]')) return;
            startTour({ tour: MAIN_ONBOARDING_TOUR, source: 'auto' });
        }, 500);

        return () => window.clearTimeout(handle);
    }, [startTour, hasCompletedTour]);

    return null;
}
