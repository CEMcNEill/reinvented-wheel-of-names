export interface TourStep {
    id: string;
    selector: string;
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom' | 'over';
    align?: 'start' | 'center' | 'end';
}

export interface Tour {
    id: string;
    name: string;
    version: string;
    steps: TourStep[];
}

export const MAIN_ONBOARDING_TOUR: Tour = {
    id: 'main_onboarding',
    name: 'Main onboarding',
    version: 'v1',
    steps: [
        {
            id: 'app-title',
            selector: '[data-tour-id="app-title"]',
            title: 'Welcome to Wheel of Names',
            description: "Let's take 30 seconds to show you around. Use Next and Prev to step through, or Skip to dismiss.",
            side: 'bottom',
            align: 'start',
        },
        {
            id: 'spin-button',
            selector: '[data-tour-id="spin-button"]',
            title: 'Spin the wheel',
            description: 'Click SPIN (or press Enter) to pick a random name from the wheel.',
            side: 'top',
            align: 'center',
        },
        {
            id: 'team-controller',
            selector: '[data-tour-id="team-controller"]',
            title: 'Your lists',
            description: 'Switch between saved teams and the Quick List here. Drag to reorder; click to select.',
            side: 'left',
            align: 'start',
        },
        {
            id: 'new-team-button',
            selector: '[data-tour-id="new-team-button"]',
            title: 'Create a team',
            description: "Click 'New Team' (or press N) to save a group of names you'll spin often.",
            side: 'left',
            align: 'center',
        },
        {
            id: 'adhoc-input',
            selector: '[data-tour-id="adhoc-input"]',
            title: 'Or paste names ad-hoc',
            description: 'Type or paste a comma-separated list here for one-off picks — no saving required.',
            side: 'left',
            align: 'center',
        },
        {
            id: 'highlander-toggle',
            selector: '[data-tour-id="highlander-toggle"]',
            title: 'Highlander Mode',
            description: 'Elimination round — each spin removes the winner until one remains. There can be only one!',
            side: 'bottom',
            align: 'end',
        },
        {
            id: 'death-toggle',
            selector: '[data-tour-id="death-toggle"]',
            title: 'Death Mode',
            description: 'A thematic reskin with flames and skulls. (Mutually exclusive with Highlander.)',
            side: 'bottom',
            align: 'end',
        },
        {
            id: 'settings-button',
            selector: '[data-tour-id="settings-button"]',
            title: 'Settings',
            description: 'Backup & restore your teams, manage integrations, and override feature flags.',
            side: 'bottom',
            align: 'end',
        },
        {
            id: 'help-button',
            selector: '[data-tour-id="help-button"]',
            title: 'Help is always here',
            description: 'Press ? or click this button anytime to see keyboard shortcuts and re-run this tour.',
            side: 'bottom',
            align: 'end',
        },
    ],
};

export function tourCompletedKey(tour: Tour): string {
    return `wot_tour_${tour.id}_completed_${tour.version}`;
}

export const POST_SPIN_TIP_KEY = 'wot_post_spin_tip_seen_v1';
