'use client';

import { useEffect } from 'react';
import { useTour } from './use-tour';

export function TourRunner() {
    const { startTour, hasCompletedTour } = useTour();

    useEffect(() => {
        if (hasCompletedTour()) return;

        const handle = window.setTimeout(() => {
            if (!document.querySelector('[data-tour-id="app-title"]')) return;
            startTour({ source: 'auto' });
        }, 500);

        return () => window.clearTimeout(handle);
    }, [startTour, hasCompletedTour]);

    return null;
}
