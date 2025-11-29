import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'standard' | 'death' | 'puppy';

interface AppState {
    theme: Theme;
    setTheme: (theme: Theme) => void;

    // Selection Mode
    mode: 'team' | 'adhoc';
    setMode: (mode: 'team' | 'adhoc') => void;

    // Team Selection
    activeTeamId: string | null;
    setActiveTeamId: (id: string | null) => void;

    // Ad-hoc List
    adHocNames: string[];
    setAdHocNames: (names: string[]) => void;

    // Wheel State
    isSpinning: boolean;
    setIsSpinning: (isSpinning: boolean) => void;
    winner: string | null;
    setWinner: (winner: string | null) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            theme: 'standard',
            setTheme: (theme) => set({ theme }),

            mode: 'adhoc',
            setMode: (mode) => set({ mode }),

            activeTeamId: null,
            setActiveTeamId: (id) => set({ activeTeamId: id }),

            adHocNames: [],
            setAdHocNames: (names) => set({ adHocNames: names }),

            isSpinning: false,
            setIsSpinning: (isSpinning) => set({ isSpinning }),
            winner: null,
            setWinner: (winner) => set({ winner }),
        }),
        {
            name: 'wheel-of-names-storage',
            partialize: (state) => ({
                theme: state.theme,
                mode: state.mode,
                activeTeamId: state.activeTeamId,
                adHocNames: state.adHocNames
            }), // Don't persist transient states like isSpinning
        }
    )
);
