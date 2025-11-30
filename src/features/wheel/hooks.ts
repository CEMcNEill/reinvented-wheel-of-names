import { useAppStore } from "@/lib/store";
import { useTeam } from "../teams/hooks";
import { useMemo } from "react";

export interface WheelSegment {
    id: string;
    text: string;
    color?: string;
    avatarUrl?: string;
}

export function useWheelSegments() {
    const { mode, activeTeamId, adHocNames, adHocTitle, excludedMemberIds } = useAppStore();
    const { team } = useTeam(activeTeamId);

    const segments: WheelSegment[] = useMemo(() => {
        if (mode === 'team' && team) {
            return team.members
                .filter(m => !excludedMemberIds.includes(m.id))
                .map(m => ({
                    id: m.id,
                    text: m.name,
                    avatarUrl: m.avatarUrl
                }));
        }

        if (mode === 'adhoc') {
            return adHocNames.map((name, i) => ({
                id: `adhoc-${i}`,
                text: name
            }));
        }

        return [];
    }, [mode, team, adHocNames, excludedMemberIds]);

    const title = mode === 'team' && team ? team.name : (adHocTitle || 'Wheel of Names');

    return { segments, title };
}
