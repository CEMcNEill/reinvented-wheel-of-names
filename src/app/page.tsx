'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { WheelCanvas } from '@/features/wheel/components/wheel-canvas';
import { WinnerModal } from '@/features/wheel/components/winner-modal';
import { WheelController } from '@/features/wheel/components/wheel-controller';
import { HelpModal } from '@/features/help/components/HelpModal';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { Button } from '@/components/ui/button';
import { HelpCircle, Settings } from 'lucide-react';

export default function Home() {
  const { theme, helpOpen, setHelpOpen, adminOpen, setAdminOpen } = useAppStore();

  // Open help modal via keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setHelpOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setHelpOpen]);
  return (
    <main className="min-h-screen p-8 transition-colors duration-300" data-theme={theme}>
      <WinnerModal />
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-heading font-bold">Wheel of Names</h1>
          <div className="flex items-center gap-2">
            {/* Settings button */}
            <Button variant="ghost" size="icon" onClick={() => setAdminOpen(true)} title="Settings">
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </Button>
            {/* Help button */}
            <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} title="Help">
              <span className="sr-only">Help</span>
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Wheel */}
          <div className="lg:col-span-7 bg-slate-50/50 rounded-[var(--radius)] p-8 flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200">
            <WheelCanvas />
          </div>

          {/* Right Column: Controls & Teams */}
          <div className="lg:col-span-5">
            <WheelController />
          </div>
        </div>

      </div>
      {/* Modals */}
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
      <AdminModal open={adminOpen} onOpenChange={setAdminOpen} />
    </main>
  );
}
