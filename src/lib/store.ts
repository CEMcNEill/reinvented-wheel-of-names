import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    // UI Modals
    helpOpen: boolean;
    setHelpOpen: (open: boolean) => void;
    adminOpen: boolean;
    setAdminOpen: (open: boolean) => void;

    // Selection Mode
    mode: 'team' | 'adhoc';
    setMode: (mode: 'team' | 'adhoc') => void;

    // Team Selection
    activeTeamId: string | null;
    setActiveTeamId: (id: string | null) => void;

    excludedMemberIds: string[];
    teamExclusions: Record<string, string[]>;
    setExcludedMemberIds: (ids: string[]) => void;
    toggleMemberExclusion: (id: string) => void;

    // Ad-hoc List
    adHocTitle: string;
    setAdHocTitle: (title: string) => void;
    adHocNames: string[];
    setAdHocNames: (names: string[]) => void;
    adHocOrder: number;
    setAdHocOrder: (order: number) => void;

    // Wheel State
    isSpinning: boolean;
    setIsSpinning: (isSpinning: boolean) => void;
    winner: string | null;
    setWinner: (winner: string | null) => void;

    spinRequest: number;
    triggerSpin: () => void;
    resetSpinRequest: () => void;

    // Debug State
    verboseLogging: boolean;
    setVerboseLogging: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // UI Modals
            helpOpen: false,
            setHelpOpen: (open) => set({ helpOpen: open }),
            adminOpen: false,
            setAdminOpen: (open) => set({ adminOpen: open }),


            mode: 'adhoc',
            setMode: (mode) => set({ mode }),

            activeTeamId: null,
            setActiveTeamId: (id) => {
                set((state) => {
                    if (state.activeTeamId === id) {
                        return {};
                    }
                    if (state.verboseLogging) {
                        console.log('STORE: setActiveTeamId called with', id);
                    }
                    // Load exclusions for this team
                    const exclusions = id ? (state.teamExclusions[id] || []) : [];
                    return { activeTeamId: id, excludedMemberIds: exclusions };
                });
            },

            excludedMemberIds: [],
            teamExclusions: {},
            setExcludedMemberIds: (ids) => {
                if (get().verboseLogging) {
                    console.log('STORE: setExcludedMemberIds called with', ids);
                }
                set((state) => {
                    const newExclusions = { ...state.teamExclusions };
                    if (state.activeTeamId) {
                        newExclusions[state.activeTeamId] = ids;
                    }

                    // Write to cookie
                    if (typeof document !== 'undefined') {
                        document.cookie = `wheel_exclusions=${JSON.stringify(newExclusions)}; path=/; max-age=31536000`;
                    }

                    return { excludedMemberIds: ids, teamExclusions: newExclusions };
                });
            },
            toggleMemberExclusion: (id) => set((state) => {
                const newIds = state.excludedMemberIds.includes(id)
                    ? state.excludedMemberIds.filter(mid => mid !== id)
                    : [...state.excludedMemberIds, id];

                const newExclusions = { ...state.teamExclusions };
                if (state.activeTeamId) {
                    newExclusions[state.activeTeamId] = newIds;
                }

                // Write to cookie
                if (typeof document !== 'undefined') {
                    document.cookie = `wheel_exclusions=${JSON.stringify(newExclusions)}; path=/; max-age=31536000`;
                }

                return {
                    excludedMemberIds: newIds,
                    teamExclusions: newExclusions
                };
            }),

            adHocTitle: '',
            setAdHocTitle: (title) => set({ adHocTitle: title }),
            adHocNames: [],
            setAdHocNames: (names) => set({ adHocNames: names }),
            adHocOrder: 0,
            setAdHocOrder: (order) => set({ adHocOrder: order }),

            isSpinning: false,
            setIsSpinning: (isSpinning) => set({ isSpinning }),
            winner: null,
            setWinner: (winner) => set({ winner }),

            spinRequest: 0,
            triggerSpin: () => set({ spinRequest: Date.now() }),
            resetSpinRequest: () => set({ spinRequest: 0 }),

            // Debug State
            verboseLogging: false,
            setVerboseLogging: (enabled) => set({ verboseLogging: enabled }),
        }),
        {
            name: 'wheel-of-names-storage',
            partialize: (state) => ({
                mode: state.mode,
                activeTeamId: state.activeTeamId,
                adHocNames: state.adHocNames,
                excludedMemberIds: state.excludedMemberIds,
                teamExclusions: state.teamExclusions,
                adHocOrder: state.adHocOrder,
                verboseLogging: state.verboseLogging // Persist debug setting
            }), // Don't persist transient states like isSpinning
        }
    )
);
