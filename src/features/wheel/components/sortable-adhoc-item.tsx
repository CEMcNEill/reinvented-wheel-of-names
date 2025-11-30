'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdHocInput } from '@/features/adhoc/components/adhoc-input';

interface SortableAdHocItemProps {
    isActive: boolean;
    onSelect: () => void;
    onNavigateUp: () => void;
    onNavigateDown: () => void;
}

export function SortableAdHocItem({ isActive, onSelect, onNavigateUp, onNavigateDown }: SortableAdHocItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: 'adhoc' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div onClick={onSelect} className="cursor-pointer">
                <div className={isActive ? "ring-2 ring-primary rounded-lg shadow-md" : ""}>
                    <AdHocInput onNavigateUp={onNavigateUp} onNavigateDown={onNavigateDown} />
                </div>
            </div>
        </div>
    );
}
