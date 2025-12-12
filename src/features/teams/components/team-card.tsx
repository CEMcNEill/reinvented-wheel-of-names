import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check, X } from "lucide-react";
import type { Team } from "../schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import styles from "./team-card.module.css";

interface TeamCardProps {
    team: Team;
    isActive: boolean;
    onSelect: (team: Team) => void;
    onEdit: (team: Team) => void;
    onDelete: (team: Team) => void;
}

export function TeamCard({ team, isActive, onSelect, onEdit, onDelete }: TeamCardProps) {
    const { excludedMemberIds, toggleMemberExclusion } = useAppStore();

    const handleCardClick = () => {
        if (!isActive) {
            onSelect(team);
        }
    };

    const handleMemberClick = (e: React.MouseEvent, memberId: string) => {
        e.stopPropagation();
        if (isActive) {
            toggleMemberExclusion(memberId);
        } else {
            // If clicking a member on an inactive team, select the team first
            onSelect(team);
        }
    };

    return (
        <Card
            className={cn(
                styles['team-card'],
                isActive ? styles['team-card--active'] : styles['team-card--inactive']
            )}
            onClick={handleCardClick}
        >
            {!team.isRemote && (
                <div className={styles['team-card__actions']}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={styles['team-card__action-btn']}
                        onClick={(e) => { e.stopPropagation(); onEdit(team); }}
                        title="Edit Team"
                    >
                        <Edit size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(styles['team-card__action-btn'], styles['team-card__action-btn--delete'])}
                        onClick={(e) => { e.stopPropagation(); onDelete(team); }}
                        title="Delete Team"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            )}
            <CardHeader className={styles['team-card__header']}>
                <CardTitle className={styles['team-card__title']}>
                    {team.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={styles['team-card__members']}>
                    {team.members.map((member) => {
                        const isExcluded = isActive && excludedMemberIds.includes(member.id);

                        let memberClass = styles['team-member-pill'];
                        if (isActive) {
                            if (isExcluded) {
                                memberClass = cn(memberClass, styles['team-member-pill--excluded']);
                            } else {
                                memberClass = cn(memberClass, styles['team-member-pill--active']);
                            }
                        } else {
                            memberClass = cn(memberClass, styles['team-member-pill--inactive']);
                        }

                        return (
                            <div
                                key={member.id}
                                onClick={(e) => handleMemberClick(e, member.id)}
                                className={memberClass}
                            >
                                {member.name}
                                {isActive && (
                                    isExcluded ? <X size={12} /> : <Check size={12} />
                                )}
                            </div>
                        );
                    })}
                </div>
                {!isActive && (
                    <p className={styles['team-card__hint']}>
                        Click to select
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
