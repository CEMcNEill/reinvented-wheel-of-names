import { useLiveQuery } from 'dexie-react-hooks';
import { teamService } from './service';

export function useTeams() {
    const teams = useLiveQuery(() => teamService.getAll());
    return {
        teams: teams ?? [],
        isLoading: teams === undefined,
    };
}

export function useTeam(id: string | null) {
    const team = useLiveQuery(
        () => (id ? teamService.getById(id) : undefined),
        [id]
    );
    return {
        team,
        isLoading: id ? team === undefined : false,
    };
}

export function useTeamActions() {
    return {
        createTeam: teamService.create,
        updateTeam: teamService.update,
        deleteTeam: teamService.delete,
        addMember: teamService.addMember,
        reorderTeams: teamService.reorder,
    };
}
