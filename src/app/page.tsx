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
import { HighlanderModeToggle } from '@/components/highlander-mode-toggle';
import { usePostHog } from 'posthog-js/react';
import { RemoteTeamsInitializer } from '@/features/teams/components/remote-teams-initializer';
import { useWheelSegments } from '@/features/wheel/hooks';

export default function Home() {
  const { helpOpen, setHelpOpen, adminOpen, setAdminOpen, isHighlanderMode, isDeathMode } = useAppStore();
  const { segments } = useWheelSegments();
  
  const showHighlanderVictory = isHighlanderMode && segments.length === 1;

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
    <main className={`min-h-screen p-8 transition-colors duration-300 relative isolate ${isHighlanderMode && !isDeathMode ? 'bg-blue-950 text-blue-100' : ''} ${isHighlanderMode ? 'font-[family-name:var(--font-highlander)]' : ''}`}>
      <RemoteTeamsInitializer />

      {isDeathMode && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 opacity-95"
          >
            <source
              src="/flames-background.mp4"
              type="video/mp4"
            />
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <WinnerModal />
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className={`text-5xl font-bold tracking-widest ${isHighlanderMode ? 'font-[family-name:var(--font-highlander)]' : 'font-heading'} ${isDeathMode ? 'text-gray-400 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]' : (isHighlanderMode ? 'text-blue-300 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : '')}`}>
            {isHighlanderMode ? (isDeathMode ? 'Highlander of Death' : 'Highlander Mode') : (isDeathMode ? 'Wheel of Death' : 'Wheel of Names')}
          </h1>
          <div className="flex items-center gap-2">
            <HighlanderModeToggle />
            <DeathModeToggle />
            {/* Settings button */}
            <Button variant="ghost" size="icon" onClick={() => setAdminOpen(true)} title="Settings" className={isDeathMode ? 'text-gray-400 hover:text-gray-300' : ''}>
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </Button>
            {/* Help button */}
            <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} title="Help" className={isDeathMode ? 'text-gray-400 hover:text-gray-300' : ''}>
              <span className="sr-only">Help</span>
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Wheel */}
          <div className={`lg:col-span-7 rounded-[var(--radius)] p-8 flex items-center justify-center min-h-[400px] border-2 border-dashed backdrop-blur-sm ${isDeathMode ? 'bg-black/30 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.3)] z-10' : (isHighlanderMode ? 'bg-blue-900/30 border-blue-500/50 shadow-[0_0_30px_rgba(30,58,138,0.5)] z-10' : 'bg-muted/30 border-border')}`}>
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
