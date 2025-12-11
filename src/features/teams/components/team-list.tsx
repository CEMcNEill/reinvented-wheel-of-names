'use client';

import { useState } from "react";
import { useTeams, useTeamActions } from "../hooks";
import { TeamCard } from "./team-card";
import { TeamForm } from "./team-form";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { Team, CreateTeamInput } from "../schema";
import { v4 as uuidv4 } from 'uuid';

export function TeamList() {
    const { teams, isLoading } = useTeams();
    const { deleteTeam, createTeam, updateTeam } = useTeamActions();
    const { activeTeamId, setActiveTeamId, setMode, setAdminOpen } = useAppStore();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const handleSelect = (team: Team) => {
        setActiveTeamId(team.id);
        setMode('team');
    };

    const handleDelete = async (team: Team) => {
        if (confirm(`Are you sure you want to delete ${team.name}?`)) {
            await deleteTeam(team.id);
            if (activeTeamId === team.id) {
                setActiveTeamId(null);
                setMode('adhoc');
            }
        }
    };

    const handleCreate = () => {
        setEditingTeam(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (data: CreateTeamInput) => {
        if (editingTeam) {
            // For simplicity, we regenerate IDs for the roster on full update.
            const membersWithIds = data.members.map(m => ({
                id: uuidv4(),
                name: m.name,
                avatarUrl: m.avatarUrl
            }));

            await updateTeam(editingTeam.id, {
                name: data.name,
                members: membersWithIds
            });
        } else {
            await createTeam(data);
        }
        setIsDialogOpen(false);
    };

    if (isLoading) {
        return <div>Loading teams...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-heading">Your Teams</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Team
                </Button>
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500 mb-4">No teams created yet.</p>
                    <Button variant="outline" onClick={handleCreate}>Create your first team</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            isActive={activeTeamId === team.id}
                            onSelect={handleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    title={editingTeam ? "Edit Team" : "Create New Team"}
                    onClose={() => setIsDialogOpen(false)}
                >
                    <TeamForm
                        initialData={editingTeam || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                        onOpenSettings={() => {
                            setIsDialogOpen(false);
                            setAdminOpen(true);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
