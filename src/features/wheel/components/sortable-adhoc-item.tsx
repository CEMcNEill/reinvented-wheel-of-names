'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdHocInput } from '@/features/adhoc/components/adhoc-input';
import { cn } from '@/lib/utils';
import styles from './sortable-item.module.css';

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
            <div onClick={onSelect} className={styles['sortable-adhoc-item']}>
                <div className={cn(
                    styles['sortable-adhoc-item__content'],
                    isActive && styles['sortable-adhoc-item__content--active']
                )}>
                    <AdHocInput onNavigateUp={onNavigateUp} onNavigateDown={onNavigateDown} />
                </div>
            </div>
        </div>
    );
}
