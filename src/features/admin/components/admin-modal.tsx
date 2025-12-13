import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { Database, Bug, Download, Upload, Globe, Cloud } from "lucide-react";
import { downloadBackup } from "../services/export-service";
import { importData } from "../services/import-service";
import { usePostHog } from 'posthog-js/react';
import { cn } from "@/lib/utils";
import styles from "./admin-modal.module.css";
import { ImportTeamModal } from "./import-team-modal";

interface AdminModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminModal({ open, onOpenChange }: AdminModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { verboseLogging, setVerboseLogging } = useAppStore();
    const posthog = usePostHog();
    const [remoteTeamsEnabled, setRemoteTeamsEnabled] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const isDeathMode = posthog.isFeatureEnabled('death_mode');

    // Sync state with PostHog flag
    useEffect(() => {
        const checkFlag = () => {
            setRemoteTeamsEnabled(!!posthog.isFeatureEnabled('enable_remote_teams'));
        };
        checkFlag();
        const unregister = posthog.onFeatureFlags(checkFlag);
        return () => unregister();
    }, [posthog]);

    const handleToggleRemoteTeams = (enabled: boolean) => {
        setRemoteTeamsEnabled(enabled);

        // Save to cookie (1 year)
        document.cookie = `enable_remote_teams=${enabled}; path=/; max-age=31536000`;

        // Read other cookies to preserve their state
        const cookies = document.cookie.split('; ');
        const deathModeCookie = cookies.find(row => row.startsWith('death_mode='));
        const isDeathMode = deathModeCookie ? deathModeCookie.split('=')[1] === 'true' : false;

        // Override PostHog flag locally, preserving other flags
        posthog.featureFlags.overrideFeatureFlags({
            flags: {
                'enable_remote_teams': enabled,
                'death_mode': isDeathMode
            }
        });
    };

    const handleExport = async () => {
        await downloadBackup();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            if (content) {
                try {
                    await importData(content);
                    alert("Data imported successfully!");
                    onOpenChange(false);
                } catch {
                    alert("Failed to import data. Please check the file format.");
                }
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <ImportTeamModal open={importModalOpen} onOpenChange={setImportModalOpen} />
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    title="Admin Panel"
                    onClose={() => onOpenChange(false)}
                    className={cn(
                        styles['admin-modal'],
                        isDeathMode && 'death_mode_vars'
                    )}
                >
                    <div className={styles['admin-modal__content']}>
                        {/* Data Management Section */}
                        <div className={styles['admin-modal__section']}>
                            <h3 className={styles['admin-modal__section-title']}>
                                <Database className="h-5 w-5" />
                                Backup & Restore
                            </h3>
                            <div className={styles['admin-modal__cards']}>
                                <div className={styles['admin-modal__card']}>
                                    <h4 className={styles['admin-modal__card-title']}>Export Data</h4>
                                    <p className={styles['admin-modal__card-desc']}>Download a JSON backup of all teams, members, and settings.</p>
                                    <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Backup
                                    </Button>
                                </div>

                                <div className={styles['admin-modal__card']}>
                                    <h4 className={styles['admin-modal__card-title']}>Import Data</h4>
                                    <p className={styles['admin-modal__card-desc']}>Restore from a JSON backup file. This will overwrite current data.</p>
                                    <div className={styles['admin-modal__action-row']}>
                                        <Input
                                            type="file"
                                            accept=".json"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleImport}
                                        />
                                        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full sm:w-auto">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Select Backup File
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrations Section */}
                        <div className={styles['admin-modal__section']}>
                            <h3 className={styles['admin-modal__section-title']}>
                                <Cloud className="h-5 w-5" />
                                Integrations
                            </h3>
                            <div className={styles['admin-modal__cards']}>
                                <div className={styles['admin-modal__card']}>
                                    <h4 className={styles['admin-modal__card-title']}>PostHog Teams</h4>
                                    <p className={styles['admin-modal__card-desc']}>Import teams directly from the PostHog employee directory.</p>
                                    <Button onClick={() => {
                                        setImportModalOpen(true);
                                        onOpenChange(false);
                                    }} variant="outline" className="w-full sm:w-auto">
                                        <Download className="mr-2 h-4 w-4" />
                                        Import from Strapi
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className={styles['admin-modal__section']}>
                            <h3 className={styles['admin-modal__section-title']}>
                                <Globe className="h-5 w-5" />
                                Experimental Features
                            </h3>
                            <div className={cn(styles['admin-modal__card'], styles['admin-modal__card--row'])}>
                                <div className={styles['admin-modal__card-header']}>
                                    <h4 className={styles['admin-modal__card-title']}>Remote Teams</h4>
                                    <p className={styles['admin-modal__card-desc']}>Enable syncing ephemeral teams from remote configuration.</p>
                                </div>
                                <Switch checked={remoteTeamsEnabled} onCheckedChange={handleToggleRemoteTeams} />
                            </div>
                        </div>

                        {/* Debug Tools Section */}
                        <div className={styles['admin-modal__section']}>
                            <h3 className={styles['admin-modal__section-title']}>
                                <Bug className="h-5 w-5" />
                                Debug Tools
                            </h3>

                            <div className={cn(styles['admin-modal__card'], styles['admin-modal__card--row'])}>
                                <div className={styles['admin-modal__card-header']}>
                                    <h4 className={styles['admin-modal__card-title']}>Verbose Logging</h4>
                                    <p className={styles['admin-modal__card-desc']}>Log detailed wheel physics and state changes to console.</p>
                                </div>
                                <Switch checked={verboseLogging} onCheckedChange={setVerboseLogging} />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
