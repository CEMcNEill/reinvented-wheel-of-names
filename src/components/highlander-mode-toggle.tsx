'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Sword } from 'lucide-react'; // Sword icon for Highlander!
import { cn } from '@/lib/utils';

export function HighlanderModeToggle() {
    const { isHighlanderMode, setIsHighlanderMode } = useAppStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsHighlanderMode(!isHighlanderMode)}
            className={cn(isHighlanderMode && "text-blue-500 hover:text-blue-400 hover:bg-blue-950/20")}
            title="Highlander Mode: There can be only one!"
        >
            <span className="sr-only">Toggle Highlander Mode</span>
            <Sword className="h-5 w-5" />
        </Button>
    );
}
