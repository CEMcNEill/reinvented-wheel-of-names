import { db } from '@/lib/db';
import { type Team, type CreateTeamInput, type TeamMember } from './schema';
import { v4 as uuidv4 } from 'uuid';

export const teamService = {
    // 1. Get all teams (ordered by custom order, then createdAt desc)
    getAll: async () => {
        // Dexie sorting is simple, for complex sort we might need to do it in memory or use compound index
        // For now, let's just get all and sort in memory since team count is low
        const teams = await db.teams.toArray();
        return teams.sort((a, b) => {
            if (a.order !== b.order) {
                return a.order - b.order;
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
    },

    // 2. Get a single team by ID
    getById: async (id: string) => {
        return await db.teams.get(id);
    },

    // 3. Create a new team
    create: async (input: CreateTeamInput) => {
        // Get max order to append to end
        const allTeams = await db.teams.toArray();
        const maxOrder = allTeams.reduce((max, t) => Math.max(max, t.order || 0), 0);

        const newTeam: Team = {
            id: uuidv4(),
            name: input.name,
            members: input.members.map(m => ({
                id: uuidv4(),
                name: m.name,
                avatarUrl: m.avatarUrl,
                role: m.role,
                isLead: m.isLead
            })),
            order: maxOrder + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.teams.add(newTeam);
        return newTeam;
    },

    // 4. Update a team
    update: async (id: string, updates: Partial<Omit<Team, 'id' | 'createdAt'>>) => {
        const team = await db.teams.get(id);
        if (!team) throw new Error('Team not found');

        const updatedTeam = {
            ...team,
            ...updates,
            updatedAt: new Date(),
        };

        await db.teams.put(updatedTeam);
        return updatedTeam;
    },

    // 5. Delete a team
    delete: async (id: string) => {
        await db.teams.delete(id);
    },

    // 6. Add a member to a team
    addMember: async (teamId: string, memberName: string, avatarUrl?: string) => {
        const team = await db.teams.get(teamId);
        if (!team) throw new Error('Team not found');

        const newMember: TeamMember = {
            id: uuidv4(),
            name: memberName,
            avatarUrl
        };

        const updatedTeam = {
            ...team,
            members: [...team.members, newMember],
            updatedAt: new Date()
        };

        await db.teams.put(updatedTeam);
        return newMember;
    },

    // 7. Reorder teams
    reorder: async (orderedIds: string[]) => {
        await db.transaction('rw', db.teams, async () => {
            const updates = orderedIds.map((id, index) => {
                return db.teams.update(id, { order: index });
            });
            await Promise.all(updates);
        });
    }
};
