'use client';

import { useAppStore } from '@/lib/store';

export default function Home() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-8 transition-colors duration-300">
      <h1 className="text-5xl font-heading font-bold">Wheel of Names</h1>
      <p className="text-xl">Current Theme: {theme}</p>

      <div className="flex gap-4">
        <button
          onClick={() => setTheme('standard')}
          className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 cursor-pointer"
        >
          Standard
        </button>
        <button
          onClick={() => setTheme('death')}
          className="px-4 py-2 bg-red-900 text-white rounded hover:bg-red-950 cursor-pointer"
        >
          Death Mode
        </button>
        <button
          onClick={() => setTheme('puppy')}
          className="px-4 py-2 bg-pink-200 text-pink-900 rounded hover:bg-pink-300 cursor-pointer"
        >
          Puppy Mode
        </button>
      </div>
    </div>
  );
}
