import { db } from "@/lib/db";
import { useAppStore } from "@/lib/store";
import { Logger } from '@/lib/logger';
import type { Team } from "@/features/teams/schema"; // Changed to type import, kept original path

export interface BackupData {
    version: number;
    timestamp: string;
    teams: Team[];
    settings: {
        adHocNames: string[];
        adHocOrder: number;
        excludedMemberIds: string[];
    };
}

export const exportData = async (): Promise<string> => {
    const teams = await db.teams.toArray();
    const state = useAppStore.getState();

    const backup: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        teams,
        settings: {
            adHocNames: state.adHocNames,
            adHocOrder: state.adHocOrder,
            excludedMemberIds: state.excludedMemberIds
        }
    };

    return JSON.stringify(backup, null, 2);
};

export const downloadBackup = async () => {
    try {
        const json = await exportData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wheel - of - names - backup - ${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        Logger.error("Export failed:", error);
        alert("Failed to export data.");
    }
};
