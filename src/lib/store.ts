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
        (set) => ({
            // UI Modals
            helpOpen: false,
            setHelpOpen: (open) => set({ helpOpen: open }),
            adminOpen: false,
            setAdminOpen: (open) => set({ adminOpen: open }),


            mode: 'adhoc',
            setMode: (mode) => set({ mode }),

            activeTeamId: null,
            setActiveTeamId: (id) => set({ activeTeamId: id, excludedMemberIds: [] }), // Clear exclusions on team change

            excludedMemberIds: [],
            setExcludedMemberIds: (ids) => set({ excludedMemberIds: ids }),
            toggleMemberExclusion: (id) => set((state) => ({
                excludedMemberIds: state.excludedMemberIds.includes(id)
                    ? state.excludedMemberIds.filter(mid => mid !== id)
                    : [...state.excludedMemberIds, id]
            })),

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
                adHocOrder: state.adHocOrder,
                verboseLogging: state.verboseLogging // Persist debug setting
            }), // Don't persist transient states like isSpinning
        }
    )
);
