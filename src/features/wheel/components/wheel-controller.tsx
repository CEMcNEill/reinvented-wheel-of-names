'use client';

import { useAppStore } from '@/lib/store';
import { useTeams, useTeamActions } from '@/features/teams/hooks';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePostHog } from 'posthog-js/react'; // For analytics
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TeamForm } from '@/features/teams/components/team-form';
import { v4 as uuidv4 } from 'uuid';
import type { Team, CreateTeamInput } from '@/features/teams/schema';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTeamItem } from './sortable-team-item';
import { SortableAdHocItem } from './sortable-adhoc-item';

export function WheelController() {
    const posthog = usePostHog();
    const { teams, isLoading } = useTeams();
    const { deleteTeam, createTeam, updateTeam } = useTeamActions();
    const { activeTeamId, setActiveTeamId, mode, setMode, adHocOrder, setAdHocOrder } = useAppStore();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    // Combine teams and adhoc item
    const items = useMemo(() => [
        ...teams.map(t => ({ ...t, type: 'team' as const })),
        { id: 'adhoc', type: 'adhoc' as const, order: adHocOrder }
    ].sort((a, b) => {
        const orderA = 'order' in a ? a.order : 0;
        const orderB = 'order' in b ? b.order : 0;
        return orderA - orderB;
    }), [teams, adHocOrder]);

    const handleSelectTeam = (team: Team) => {
        setActiveTeamId(team.id);
        setMode('team');
    };

    const handleSelectAdHoc = () => {
        setMode('adhoc');
        setActiveTeamId(null);
    };

    const handleCreate = useCallback(() => {
        setEditingTeam(null);
        setIsDialogOpen(true);
    }, []);

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setIsDialogOpen(true);
    };

    const handleNavigate = useCallback((direction: 'up' | 'down') => {
        let currentIndex = -1;
        if (mode === 'adhoc') {
            currentIndex = items.findIndex(i => i.type === 'adhoc');
        } else if (mode === 'team' && activeTeamId) {
            currentIndex = items.findIndex(i => i.id === activeTeamId);
        }

        let nextIndex = currentIndex;
        if (direction === 'up') {
            if (currentIndex === -1) {
                nextIndex = items.length - 1; // Select last if nothing selected
            } else {
                nextIndex = Math.max(0, currentIndex - 1);
            }
        } else {
            if (currentIndex === -1) {
                nextIndex = 0; // Select first if nothing selected
            } else {
                nextIndex = Math.min(items.length - 1, currentIndex + 1);
            }
        }

        if (nextIndex !== -1 && nextIndex !== currentIndex) {
            const nextItem = items[nextIndex];
            if (nextItem.type === 'adhoc') {
                setMode('adhoc');
                setActiveTeamId(null);
            } else {
                setMode('team');
                setActiveTeamId(nextItem.id);
            }
        }
    }, [mode, activeTeamId, items, setMode, setActiveTeamId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isDialogOpen) return;

            // Don't trigger shortcuts if user is typing in an input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // 'N' for New Team
            if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                handleCreate();
                return;
            }

            // Arrow keys for navigation
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleNavigate('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleNavigate('down');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDialogOpen, handleCreate, handleNavigate]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDelete = async (team: Team) => {
        if (confirm(`Are you sure you want to delete ${team.name}?`)) {
            await deleteTeam(team.id);
            if (activeTeamId === team.id) {
                setActiveTeamId(null);
                setMode('adhoc');
            }
        }
    };

    const handleSubmit = async (data: CreateTeamInput) => {
        // Analytics: Track team interaction
        const distinctId = posthog.get_distinct_id();

        if (editingTeam) {
            const membersWithIds = data.members.map(m => ({
                id: uuidv4(),
                name: m.name,
                avatarUrl: m.avatarUrl
            }));

            await updateTeam(editingTeam.id, {
                name: data.name,
                members: membersWithIds
            });
            posthog.capture('team_updated', {
                team_id: editingTeam.id,
                team_name: data.name,
                member_count: data.members.length
            });
        } else {
            const newTeam = await createTeam(data);
            setActiveTeamId(newTeam.id);
            setMode('team');

            // Link Team to Anonymous User
            // We use local state to determine if this is the first team
            const isFirstTeam = teams.length === 0;

            posthog.capture('team_created', {
                team_id: newTeam.id,
                team_name: newTeam.name,
                member_count: newTeam.members.length,
                $set: {
                    last_team_created: newTeam.name,
                    teams_created: teams.length + 1,
                    ...(isFirstTeam ? { first_team_created_at: new Date().toISOString() } : {})
                }
            });
        }
        setIsDialogOpen(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newOrder = arrayMove(items, oldIndex, newIndex);

            // Update orders for all items
            newOrder.forEach((item, index) => {
                if (item.type === 'adhoc') {
                    setAdHocOrder(index);
                } else {
                    updateTeam(item.id, { order: index });
                }
            });
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-heading">Choose a List</h2>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Team
                </Button>
            </div>

            <div className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map(i => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((item) => {
                            if (item.type === 'adhoc') {
                                return (
                                    <SortableAdHocItem
                                        key="adhoc"
                                        isActive={mode === 'adhoc'}
                                        onSelect={handleSelectAdHoc}
                                        onNavigateUp={() => handleNavigate('up')}
                                        onNavigateDown={() => handleNavigate('down')}
                                    />
                                );
                            } else {
                                return (
                                    <SortableTeamItem
                                        key={item.id}
                                        team={item as Team}
                                        isActive={mode === 'team' && activeTeamId === item.id}
                                        onSelect={handleSelectTeam}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                );
                            }
                        })}
                    </SortableContext>
                </DndContext>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    title={editingTeam ? "Edit Team" : "Create New Team"}
                    onClose={() => setIsDialogOpen(false)}
                >
                    <TeamForm
                        initialData={editingTeam || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
