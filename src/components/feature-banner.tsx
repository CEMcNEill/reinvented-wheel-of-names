'use client';

import { useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { X, Sparkles } from 'lucide-react';
import { useTour } from '@/features/tour/use-tour';

const BANNER_ID = 'product_tours_launch_v1';

export function FeatureBanner() {
    const posthog = usePostHog();
    const { startTour } = useTour();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!visible) return;
        posthog.capture('feature_banner_shown', { banner_id: BANNER_ID });
    }, [posthog, visible]);

    const handleDismiss = () => {
        posthog.capture('feature_banner_dismissed', { banner_id: BANNER_ID });
        setVisible(false);
    };

    const handleCta = () => {
        posthog.capture('feature_banner_cta_clicked', { banner_id: BANNER_ID });
        setVisible(false);
        startTour({ source: 'manual' });
    };

    if (!visible) return null;

    return (
        <div
            role="region"
            aria-label="New feature announcement"
            className="bg-primary text-primary-foreground"
        >
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                <p className="flex-1 leading-snug">
                    <span className="font-semibold">New:</span> Product tours are here — get a quick guided walkthrough of the wheel.
                </p>
                <button
                    type="button"
                    onClick={handleCta}
                    className="underline underline-offset-2 hover:opacity-80 font-medium whitespace-nowrap"
                >
                    Take the tour
                </button>
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Dismiss banner"
                    className="rounded-md p-1 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
