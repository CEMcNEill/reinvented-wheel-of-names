import posthog from 'posthog-js';

export const initPostHog = () => {
    if (typeof window !== 'undefined') {
        const cookies = document.cookie.split('; ');
        const deathModeCookie = cookies.find(row => row.startsWith('death_mode='));
        const remoteTeamsCookie = cookies.find(row => row.startsWith('enable_remote_teams='));

        const isDeathMode = deathModeCookie ? deathModeCookie.split('=')[1] === 'true' : false;
        const isRemoteTeams = remoteTeamsCookie ? remoteTeamsCookie.split('=')[1] === 'true' : false;

        const bootstrapFlags: Record<string, boolean | string> = {};
        if (deathModeCookie) bootstrapFlags['death_mode'] = isDeathMode;
        if (remoteTeamsCookie) bootstrapFlags['enable_remote_teams'] = isRemoteTeams;

        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            opt_in_site_apps: true,
            bootstrap: {
                featureFlags: bootstrapFlags,
            },
            loaded: (posthog) => {
                if (process.env.NODE_ENV === 'development') posthog.debug();
            },
        });
    }
};

export { posthog };
