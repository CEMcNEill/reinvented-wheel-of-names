import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Check, X } from "lucide-react";
import type { Team } from "../schema";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
                "transition-all cursor-pointer hover:border-slate-400 group relative",
                isActive ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md" : ""
            )}
            onClick={handleCardClick}
        >
            <div className="absolute top-2 right-2 flex gap-1 z-10">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={(e) => { e.stopPropagation(); onEdit(team); }} title="Edit Team">
                    <Edit size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); onDelete(team); }} title="Delete Team">
                    <Trash2 size={14} />
                </Button>
            </div>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 pt-6">
                <CardTitle className="text-lg font-bold pr-16">
                    {team.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => {
                        const isExcluded = isActive && excludedMemberIds.includes(member.id);
                        return (
                            <div
                                key={member.id}
                                onClick={(e) => handleMemberClick(e, member.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer select-none flex items-center gap-1",
                                    isActive
                                        ? (isExcluded
                                            ? "bg-slate-100 text-slate-400 border-slate-200 decoration-slate-400"
                                            : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20")
                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                )}
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
                    <p className="text-xs text-slate-400 mt-4 text-center">
                        Click to select
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
