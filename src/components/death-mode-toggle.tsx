'use client';

import { usePostHog } from 'posthog-js/react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';
import { useEffect } from 'react';

export function DeathModeToggle() {
    const posthog = usePostHog();
    const { isDeathMode, setIsDeathMode } = useAppStore();

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
        // Sync body class with store state
        if (isDeathMode) {
            document.body.classList.add('death_mode');
        } else {
            document.body.classList.remove('death_mode');
        }

        // Sync PostHog feature flag
        posthog.featureFlags.overrideFeatureFlags({
            flags: {
                'death_mode': isDeathMode
            }
        });
    }, [isDeathMode, posthog]);

    const toggleDeathMode = () => {
        const newValue = !isDeathMode;
        setIsDeathMode(newValue);

        // Save to cookie for persistence (1 year)
        document.cookie = `death_mode=${newValue}; path=/; max-age=31536000`;
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
