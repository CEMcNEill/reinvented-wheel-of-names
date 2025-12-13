'use client';

import { posthog, initPostHog } from '@/lib/posthog';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const verboseLogging = useAppStore(state => state.verboseLogging);

    useEffect(() => {
        initPostHog();
    }, []);

    useEffect(() => {
        posthog.debug(verboseLogging);
    }, [verboseLogging]);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
