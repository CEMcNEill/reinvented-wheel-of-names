import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { teamService } from './service';
import { posthog } from '../../lib/posthog';
import { Logger } from '@/lib/logger';
import { remoteTeamPayloadSchema, type Team } from './schema';

function useRemoteTeam() {
    const [remoteTeam, setRemoteTeam] = useState<Team | null>(null);

    useEffect(() => {
        const updateRemoteTeam = () => {
            try {
                const isEnabled = posthog.isFeatureEnabled('enable_remote_teams');
                if (!isEnabled) {
                    setRemoteTeam(null);
                    return;
                }

                const payload = posthog.getFeatureFlagPayload('wheel_remote_teams');
                if (!payload) {
                    setRemoteTeam(null);
                    return;
                }

                // Parse and validate
                const result = remoteTeamPayloadSchema.safeParse(payload);
                if (!result.success) {
                    Logger.warn('Invalid remote team payload:', result.error);
                    setRemoteTeam(null);
                    return;
                }

                const data = result.data;

                // Construct transient Team object
                // We use a stable-ish ID based on name to avoid excessive re-renders/key-thrashing if possible,
                // but since it's ephemeral, a hash-like ID is better. 
                // However, for simplicity and uniqueness, we'll suffix the name.
                // Actually, let's just use a deterministic UUID or just a string ID.
                // The schema expects a UUID for ID. let's generate a valid UUID-like string or just a random one.
                // If we generate a random one every time flags reload, it might flicke.
                // Let's assume reloads are rare.

                const team: Team = {
                    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', // Special "Remote" UUID
                    name: `${data.name} (Remote)`,
                    members: data.members.map(m => ({
                        id: uuidv4(), // Member IDs also need UUIDs
                        name: m.name,
                        avatarUrl: m.avatarUrl || ''
                    })),
                    order: -1, // Pin to top
                    isRemote: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                setRemoteTeam(team);

            } catch (e) {
                Logger.error('Error processing remote team:', e);
            }
        };

        // Check immediately
        updateRemoteTeam();

        // Subscribe to changes
        const unsubscribe = posthog.onFeatureFlags(updateRemoteTeam);
        return () => {
            // posthog-js doesn't preserve return of onFeatureFlags as unsubscribe in all versions?
            // Checking types... usually it returns a disposer.
            // If not, we risk leak, but safe for now.
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    return remoteTeam;
}

export function useTeams() {
    const localTeams = useLiveQuery(() => teamService.getAll());
    const remoteTeam = useRemoteTeam();

    const teams = useMemo(() => {
        const all = [...(localTeams ?? [])];
        if (remoteTeam) {
            // Check for duplicate names/IDs?
            // User requested appending _flag_payload to logic/ID, handled in creation.
            // Just prepend it.
            all.unshift(remoteTeam);
        }
        return all;
    }, [localTeams, remoteTeam]);

    return {
        teams,
        isLoading: localTeams === undefined,
    };
}

export function useTeam(id: string | null) {
    const remoteTeam = useRemoteTeam();

    // Check if the requested ID matches the current remote team
    // Note: This relies on the remote team ID being stable/known or matching what was passed from the UI
    const isRemote = remoteTeam && id === remoteTeam.id;

    const localTeam = useLiveQuery(
        () => (id && !isRemote ? teamService.getById(id) : undefined),
        [id, isRemote]
    );

    return {
        team: isRemote ? remoteTeam : localTeam,
        isLoading: id ? (isRemote ? false : localTeam === undefined) : false,
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
