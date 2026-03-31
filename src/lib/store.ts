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

    // Feature Modes
    isHighlanderMode: boolean;
    setIsHighlanderMode: (enabled: boolean) => void;
    isDeathMode: boolean;
    setIsDeathMode: (enabled: boolean) => void;

    // Team Selection
    activeTeamId: string | null;
    setActiveTeamId: (id: string | null) => void;

    excludedMemberIds: string[];
    teamExclusions: Record<string, string[]>;
    setExcludedMemberIds: (ids: string[]) => void;
    toggleMemberExclusion: (id: string) => void;
    addMemberExclusion: (id: string) => void; // For Highlander

    // Ad-hoc List
    adHocTitle: string;
    setAdHocTitle: (title: string) => void;
    adHocNames: string[];
    setAdHocNames: (names: string[]) => void;
    adHocOrder: number;
    setAdHocOrder: (order: number) => void;
    adHocExclusions: number[];
    setAdHocExclusions: (indices: number[]) => void;

    // Wheel State
    isSpinning: boolean;
    setIsSpinning: (isSpinning: boolean) => void;
    winner: string | null;
    setWinner: (winner: string | null) => void;

    spinRequest: number;
    triggerSpin: () => void;
    resetSpinRequest: () => void;

    // Actions
    removeActiveSegment: (id: string, text: string) => void;
    resetHighlander: () => void;

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

            isHighlanderMode: false,
            setIsHighlanderMode: (enabled) => {
                const state = get();
                // If exiting highlander mode, reset exclusions
                if (state.isHighlanderMode && !enabled) {
                    state.resetHighlander();
                }
                set({ 
                    isHighlanderMode: enabled,
                    isDeathMode: enabled ? false : state.isDeathMode 
                });
            },
            isDeathMode: false,
            setIsDeathMode: (enabled) => {
                const state = get();
                // If enabling death mode while highlander is on, reset highlander
                if (enabled && state.isHighlanderMode) {
                    state.resetHighlander();
                }
                set({ 
                    isDeathMode: enabled,
                    isHighlanderMode: enabled ? false : state.isHighlanderMode
                });
            },

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
            addMemberExclusion: (id) => set((state) => {
                const newIds = state.excludedMemberIds.includes(id)
                    ? state.excludedMemberIds
                    : [...state.excludedMemberIds, id];

                const newExclusions = { ...state.teamExclusions };
                if (state.activeTeamId) {
                    newExclusions[state.activeTeamId] = newIds;
                }

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
            setAdHocNames: (names) => set({ adHocNames: names, adHocExclusions: [] }), // clear exclusions when names change
            adHocOrder: 0,
            setAdHocOrder: (order) => set({ adHocOrder: order }),
            adHocExclusions: [],
            setAdHocExclusions: (indices) => set({ adHocExclusions: indices }),

            isSpinning: false,
            setIsSpinning: (isSpinning) => set({ isSpinning }),
            winner: null,
            setWinner: (winner) => set({ winner }),

            spinRequest: 0,
            triggerSpin: () => set({ spinRequest: Date.now() }),
            resetSpinRequest: () => set({ spinRequest: 0 }),

            removeActiveSegment: (id, text) => {
                const state = get();
                if (state.mode === 'team') {
                    state.addMemberExclusion(id);
                } else {
                    if (id.startsWith('adhoc-')) {
                        const index = parseInt(id.split('-')[1]);
                        if (!isNaN(index)) {
                            set({ adHocExclusions: [...state.adHocExclusions, index] });
                        }
                    }
                }
            },

            resetHighlander: () => {
                const state = get();
                if (state.mode === 'team') {
                    state.setExcludedMemberIds([]);
                } else {
                    set({ adHocExclusions: [] });
                }
            },

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
                isHighlanderMode: state.isHighlanderMode,
                isDeathMode: state.isDeathMode,
                verboseLogging: state.verboseLogging // Persist debug setting
            }), // Don't persist transient states like isSpinning
        }
    )
);
