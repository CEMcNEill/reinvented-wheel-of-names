'use client';

import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DeathModeToggle() {
    const posthog = usePostHog();
    const [isDeathMode, setIsDeathMode] = useState(false);

    useEffect(() => {
        // Check cookie for persistence on mount
        const cookies = document.cookie.split('; ');
        const deathModeCookie = cookies.find(row => row.startsWith('death_mode='));
        if (deathModeCookie) {
            const isEnabled = deathModeCookie.split('=')[1] === 'true';
            if (isEnabled) {
                posthog.featureFlags.overrideFeatureFlags({
                    flags: {
                        'death_mode': true
                    }
                });
            }
        }
    }, [posthog]);

    useEffect(() => {
        // Sync state with PostHog flag
        const checkFlag = () => {
            const flagValue = posthog.isFeatureEnabled('death_mode');
            setIsDeathMode(!!flagValue);

            // Update body class
            if (flagValue) {
                document.body.classList.add('death_mode');
            } else {
                document.body.classList.remove('death_mode');
            }
        };

        checkFlag();
        // Listen for flag changes if needed, but for now we rely on the manual toggle
        // and re-checking. PostHog's onFeatureFlags is useful here.
        const unregister = posthog.onFeatureFlags(checkFlag);
        return () => unregister();
    }, [posthog]);

    const toggleDeathMode = () => {
        const newValue = !isDeathMode;
        setIsDeathMode(newValue);

        // Save to cookie for persistence (1 year)
        document.cookie = `death_mode=${newValue}; path=/; max-age=31536000`;

        // Read other cookies to preserve their state
        const cookies = document.cookie.split('; ');
        const remoteTeamsCookie = cookies.find(row => row.startsWith('enable_remote_teams='));
        const remoteTeamsEnabled = remoteTeamsCookie ? remoteTeamsCookie.split('=')[1] === 'true' : false;

        // Override the feature flag locally, preserving other flags
        posthog.featureFlags.overrideFeatureFlags({
            flags: {
                'death_mode': newValue,
                'enable_remote_teams': remoteTeamsEnabled
            }
        });

        // Immediate UI feedback
        if (newValue) {
            document.body.classList.add('death_mode');
        } else {
            document.body.classList.remove('death_mode');
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleDeathMode}
            className={isDeathMode ? "text-red-500 hover:text-red-400 hover:bg-red-950/20" : ""}
        >
            <span className="sr-only">Toggle Death Mode</span>
            <Skull className="h-5 w-5" />
        </Button>
    );
}
