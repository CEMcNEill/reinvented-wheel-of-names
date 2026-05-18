'use client';

import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTour } from './use-tour';

export function TourButton() {
    const { startTour } = useTour();
    const { isDeathMode } = useAppStore();

    return (
        <Button
            type="button"
            size="sm"
            onClick={() => startTour({ source: 'manual' })}
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
