import posthog from 'posthog-js';

export const initPostHog = () => {
    if (typeof window !== 'undefined') {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            opt_in_site_apps: true,
            loaded: (posthog) => {
                if (process.env.NODE_ENV === 'development') posthog.debug();
            },
        });
    }
};

export { posthog };
