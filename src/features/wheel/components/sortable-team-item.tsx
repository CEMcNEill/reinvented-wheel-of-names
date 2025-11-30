'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TeamCard } from '@/features/teams/components/team-card';
import type { Team } from '@/features/teams/schema';

interface SortableTeamItemProps {
    team: Team;
    isActive: boolean;
    onSelect: (team: Team) => void;
    onEdit: (team: Team) => void;
    onDelete: (team: Team) => void;
}

export function SortableTeamItem({ team, isActive, onSelect, onEdit, onDelete }: SortableTeamItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: team.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TeamCard
                team={team}
                isActive={isActive}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
