'use client';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { WheelCanvas } from '@/features/wheel/components/wheel-canvas';
import { WinnerModal } from '@/features/wheel/components/winner-modal';
import { WheelController } from '@/features/wheel/components/wheel-controller';
import { HelpModal } from '@/features/help/components/HelpModal';
import { AdminModal } from '@/features/admin/components/admin-modal';
import { Button } from '@/components/ui/button';
import { HelpCircle, Settings } from 'lucide-react';
import { DeathModeToggle } from '@/components/death-mode-toggle';
import { usePostHog } from 'posthog-js/react';
import { RemoteTeamsInitializer } from '@/features/teams/components/remote-teams-initializer';

export default function Home() {
  const { helpOpen, setHelpOpen, adminOpen, setAdminOpen, winner } = useAppStore();
  const posthog = usePostHog();
  const [isDeathMode, setIsDeathMode] = useState(false);

  useEffect(() => {
    // Sync state with PostHog flag to control video mounting
    const checkFlag = () => {
      setIsDeathMode(!!posthog.isFeatureEnabled('death_mode'));
    };
    checkFlag();
    const unregister = posthog.onFeatureFlags(checkFlag);
    return () => unregister();
  }, [posthog]);

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
    <main className="min-h-screen p-8 transition-colors duration-300 relative isolate">
      <RemoteTeamsInitializer />

      {/* Background Video for Death Mode */}
      {isDeathMode && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <video
            key={winner ? 'winner' : 'normal'} // Key forces re-mount on change
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-60"
          >
            <source
              src={winner ? "/fire-confetti.mp4" : "/flames-background.mp4"}
              type="video/mp4"
            />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
        </div>
      )}

      <WinnerModal />
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className={`text-4xl font-heading font-bold ${isDeathMode ? 'text-gray-400' : ''}`}>
            {isDeathMode ? 'Wheel of Death' : 'Wheel of Names'}
          </h1>
          <div className="flex items-center gap-2">
            <DeathModeToggle />
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
          <div className="lg:col-span-7 bg-muted/30 rounded-[var(--radius)] p-8 flex items-center justify-center min-h-[400px] border-2 border-dashed border-border backdrop-blur-sm">
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
