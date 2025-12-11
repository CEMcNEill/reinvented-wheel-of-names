'use client';

import { usePostHog } from 'posthog-js/react';
import { Button } from '@/components/ui/button';
import { Skull } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DeathModeToggle() {
    const posthog = usePostHog();
    const [isDeathMode, setIsDeathMode] = useState(false);

    useEffect(() => {
        // Sync state with PostHog flag
        const checkFlag = () => {
            const flagValue = posthog.isFeatureEnabled('death-mode');
            setIsDeathMode(!!flagValue);

            // Update body class
            if (flagValue) {
                document.body.classList.add('death-mode');
            } else {
                document.body.classList.remove('death-mode');
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

        // Override the feature flag locally
        posthog.featureFlags.overrideFeatureFlags({
            flags: {
                'death-mode': newValue
            }
        });

        // Immediate UI feedback
        if (newValue) {
            document.body.classList.add('death-mode');
        } else {
            document.body.classList.remove('death-mode');
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
