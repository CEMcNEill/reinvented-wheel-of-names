'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function RemoteTeamsInitializer() {
    const posthog = usePostHog();

    useEffect(() => {
        // Check cookie for persistence on mount
        if (typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ');
            const cookie = cookies.find(row => row.startsWith('enable_remote_teams='));
            if (cookie) {
                const isEnabled = cookie.split('=')[1] === 'true';
                // Apply override if cookie exists
                posthog.featureFlags.overrideFeatureFlags({
                    flags: {
                        'enable_remote_teams': isEnabled
                    }
                });
            } else {
                // Bootstrap to false if no cookie set
                posthog.featureFlags.overrideFeatureFlags({
                    flags: {
                        'enable_remote_teams': false
                    }
                });
            }
        }
    }, [posthog]);

    return null;
}
