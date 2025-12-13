import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchTeams, fetchTeamMembers, type StrapiTeam } from '@/features/teams/services/strapi-service';
import { useTeamActions } from '@/features/teams/hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logger } from '@/lib/logger';
import { usePostHog } from 'posthog-js/react';
import { useAppStore } from '@/lib/store';

interface ImportTeamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImportTeamModal({ open, onOpenChange }: ImportTeamModalProps) {
    const { verboseLogging, setExcludedMemberIds, setActiveTeamId, setMode } = useAppStore();
    const [teams, setTeams] = useState<StrapiTeam[]>([]);
    const [loading, setLoading] = useState(false);
    const [importingInfo, setImportingInfo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { createTeam } = useTeamActions();
    const posthog = usePostHog();
    const isDeathMode = posthog.isFeatureEnabled('death_mode');

    const loadTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTeams();
            if (verboseLogging) {
                Logger.log('🚀 Fetched teams from Strapi:', data);
            }
            setTeams(data);
        } catch (err) {
            Logger.error(err);
            setError('Failed to load teams from PostHog.');
        } finally {
            setLoading(false);
        }
    }, [verboseLogging]);

    useEffect(() => {
        if (open) {
            loadTeams();
        }
    }, [open, loadTeams]);

    const handleImport = async (team: StrapiTeam) => {
        setImportingInfo(team.name);
        try {
            const details = await fetchTeamMembers(team.slug);
            if (!details) {
                throw new Error('Team details not found.');
            }

            // Log the full team details before creating the local team
            if (verboseLogging) {
                Logger.log('🚀 Importing team:', {
                    name: details.teamName,
                    members: details.members.map(m => ({
                        firstName: m.firstName,
                        lastName: m.lastName,
                        avatarUrl: m.avatarUrl,
                        role: m.role,
                        isLead: m.isLead ?? false,
                    })),
                });
            }

            // Create team in store
            const created = await createTeam({
                name: details.teamName,
                members: details.members.map(m => ({
                    name: `${m.firstName} ${m.lastName}`.trim(),
                    avatarUrl: m.avatarUrl || undefined,
                    isLead: m.isLead ?? false,
                    role: m.role || undefined,
                })),
            });
            if (verboseLogging) {
                Logger.log('✅ Created local team:', created);
            }

            if (verboseLogging) {
                Logger.log('🔄 Setting active team ID:', created.id);
            }
            setActiveTeamId(created.id);
            setMode('team');

            // identify leads and exclude them
            const leadIds = created.members.filter(m => m.isLead).map(m => m.id);
            if (verboseLogging) {
                Logger.log('🔍 Found leads to exclude:', leadIds);
            }

            if (leadIds.length > 0) {
                setTimeout(() => {
                    setExcludedMemberIds(leadIds);
                    if (verboseLogging) {
                        Logger.log('✅ Dispatched setExcludedMemberIds (delayed) with:', leadIds);
                    }
                }, 100);
            }

            onOpenChange(false);
        } catch (err) {
            Logger.error(err);
            setError(`Failed to import ${team.name}.`);
        } finally {
            setImportingInfo(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                title="Import Team from PostHog"
                onClose={() => onOpenChange(false)}
                className={cn(isDeathMode && 'death_mode_vars')}
            >
                <div className="flex-1 overflow-hidden min-h-[300px] max-h-[60vh] flex flex-col">
                    {loading ? (
                        <div className="flex h-full flex-1 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 text-destructive">
                            <AlertCircle className="h-8 w-8" />
                            <p>{error}</p>
                            <Button variant="outline" onClick={loadTeams}>Retry</Button>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4 p-1 sm:grid-cols-3">
                                {teams.map(team => (
                                    <button
                                        key={team.id}
                                        className="relative flex flex-col items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors text-center disabled:opacity-50 group"
                                        onClick={() => handleImport(team)}
                                        disabled={importingInfo !== null}
                                    >
                                        <div className="h-16 w-16 overflow-hidden rounded-full bg-muted shadow-sm group-hover:scale-105 transition-transform">
                                            {team.crestUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={team.crestUrl} alt={team.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">No Img</div>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm line-clamp-2 leading-tight">{team.name}</span>
                                        {importingInfo === team.name && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg backdrop-blur-[1px]">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
