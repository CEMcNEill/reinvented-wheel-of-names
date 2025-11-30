import { z } from 'zod';

// 1. Define the Member Schema
export const teamMemberSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    avatarUrl: z.string().url().optional().or(z.literal('')),
});

// 2. Define the Team Schema
export const teamSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Team name is required").max(50, "Team name is too long"),
    members: z.array(teamMemberSchema),
    order: z.number().default(0),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// 3. Define Input Schemas (for creating/updating)
// Omit system-managed fields like id, createdAt, updatedAt for creation
export const createTeamSchema = teamSchema.pick({ name: true }).extend({
    members: z.array(z.object({
        name: z.string().max(50, "Name is too long"), // Allow empty strings for form handling
        avatarUrl: z.string().url().optional().or(z.literal(''))
    })),
});

// 4. Export Types derived from Zod
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Team = z.infer<typeof teamSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
