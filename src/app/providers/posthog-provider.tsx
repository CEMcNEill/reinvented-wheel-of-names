'use client';

import { posthog, initPostHog } from '@/lib/posthog';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initPostHog();
    }, []);

    return <PHProvider client={posthog}>{children}</PHProvider>;
}
