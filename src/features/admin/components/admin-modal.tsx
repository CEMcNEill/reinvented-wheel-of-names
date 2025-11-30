import { useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { Database, Bug, Download, Upload } from "lucide-react";
import { downloadBackup } from "../services/export-service";
import { importData } from "../services/import-service";

interface AdminModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdminModal({ open, onOpenChange }: AdminModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { verboseLogging, setVerboseLogging } = useAppStore();

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent title="Admin Panel" onClose={() => onOpenChange(false)} className="max-w-2xl">
                <div className="space-y-8 py-4">
                    {/* Data Management Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Backup & Restore
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <h4 className="font-medium">Export Data</h4>
                                <p className="text-sm text-muted-foreground">Download a JSON backup of all teams, members, and settings.</p>
                                <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Backup
                                </Button>
                            </div>

                            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <h4 className="font-medium">Import Data</h4>
                                <p className="text-sm text-muted-foreground">Restore from a JSON backup file. This will overwrite current data.</p>
                                <div className="flex gap-2">
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

                    {/* Debug Tools Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Bug className="h-5 w-5" />
                            Debug Tools
                        </h3>

                        <div className="p-4 border rounded-lg bg-muted/50 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <h4 className="font-medium">Verbose Logging</h4>
                                <p className="text-sm text-muted-foreground">Log detailed wheel physics and state changes to console.</p>
                            </div>
                            <Switch checked={verboseLogging} onCheckedChange={setVerboseLogging} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
