import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTeamSchema, type CreateTeamInput, type Team } from "../schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Settings } from "lucide-react";

interface TeamFormProps {
    initialData?: Team;
    onSubmit: (data: CreateTeamInput) => void;
    onCancel: () => void;
    onOpenSettings?: () => void;
}

export function TeamForm({ initialData, onSubmit, onCancel, onOpenSettings }: TeamFormProps) {
    const {
        register,
        control,
        handleSubmit,
        setFocus,
        getValues,
        formState: { errors },
    } = useForm<CreateTeamInput>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            members: initialData.members.map(m => ({ name: m.name, avatarUrl: m.avatarUrl || '' }))
        } : {
            name: "",
            members: [{ name: "", avatarUrl: "" }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "members",
    });

    const handleFormSubmit = (data: CreateTeamInput) => {
        // Filter out empty members
        const cleanedData = {
            ...data,
            members: data.members.filter(m => m.name.trim() !== "")
        };
        onSubmit(cleanedData);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setFocus('members.0.name');
        }
    };

    const handleMemberKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentName = getValues(`members.${index}.name`);

            if (!currentName || currentName.trim() === "") {
                // If blank, submit the form
                handleSubmit(handleFormSubmit)();
            } else {
                // If not blank, add new member
                append({ name: "", avatarUrl: "" });
                // Wait for render then focus new input
                setTimeout(() => setFocus(`members.${index + 1}.name`), 0);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                    id="name"
                    placeholder="e.g. Engineering Team"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                    autoFocus
                    onKeyDown={handleNameKeyDown}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label>Members</Label>
                        <p className="text-xs text-muted-foreground">
                            Press Enter to add a new member, or press Enter on an empty line to save and close.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ name: "", avatarUrl: "" })}
                        tabIndex={-1}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Member Name"
                                    {...register(`members.${index}.name`)}
                                    className={errors.members?.[index]?.name ? "border-red-500" : ""}
                                    onKeyDown={(e) => handleMemberKeyDown(e, index)}
                                />
                                {errors.members?.[index]?.name && (
                                    <p className="text-xs text-red-500">{errors.members[index]?.name?.message}</p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-red-500"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1 && index === 0}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
                {errors.members && (
                    <p className="text-sm text-red-500">{errors.members.message}</p>
                )}
            </div>

            {!initialData && onOpenSettings && (
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <span>You can also import teams from settings.</span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onOpenSettings}
                        title="Open Settings"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? 'Update Team' : 'Create Team'}
                </Button>
            </div>
        </form>
    );
}
