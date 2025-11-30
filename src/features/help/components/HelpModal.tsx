import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                title="How to Use"
                onClose={() => onOpenChange(false)}
                className={cn('max-w-2xl')}
            >
                <div className="space-y-4 text-sm text-gray-800">
                    <p>
                        This application lets you spin a wheel of names. You can manage teams and add ad‑hoc names.
                    </p>
                    <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>?</strong> – Open this help dialog</li>
                        <li><strong>N</strong> – Create a new team</li>
                        <li><strong>↑ / ↓</strong> – Navigate between teams / ad‑hoc items</li>
                        <li><strong>Enter</strong> – Spin the wheel</li>
                    </ul>
                    <p className="mt-2">
                        For more detailed documentation, visit the{' '}
                        <a
                            href="https://github.com/CEMcNEill/reinvented-wheel-of-names"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            project README
                        </a>.
                    </p>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
