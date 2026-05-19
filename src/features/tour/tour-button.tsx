'use client';

import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTour } from './use-tour';
import { MAIN_ONBOARDING_TOUR } from './tour-steps';

export function TourButton() {
    const { startTour } = useTour();
    const { isDeathMode } = useAppStore();

    return (
        <Button
            type="button"
            size="sm"
            onClick={() => startTour({ tour: MAIN_ONBOARDING_TOUR, source: 'manual' })}
            title="Take the tour"
            aria-label="Take the tour"
            className={`fixed bottom-4 left-4 z-40 shadow-lg rounded-full pl-3 pr-4 gap-2 ${
                isDeathMode
                    ? 'bg-red-900 hover:bg-red-800 text-white border-2 border-red-500'
                    : ''
            }`}
        >
            <Compass className="h-4 w-4" />
            <span>Take the tour</span>
        </Button>
    );
}
