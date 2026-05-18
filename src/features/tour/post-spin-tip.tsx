'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { POST_SPIN_TIP_KEY } from './tour-steps';

interface PostSpinTipProps {
    isHighlanderMode: boolean;
    isDeathMode: boolean;
}

export function PostSpinTip({ isHighlanderMode, isDeathMode }: PostSpinTipProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const seen = window.localStorage.getItem(POST_SPIN_TIP_KEY) === '1';
        if (!seen) {
            setVisible(true);
            window.localStorage.setItem(POST_SPIN_TIP_KEY, '1');
        }
    }, []);

    if (!visible) return null;

    const tipText = isHighlanderMode
        ? "In Highlander Mode, the winner is automatically eliminated. Keep spinning until one remains!"
        : "Tip: open a team in the right column and click any name to exclude them from future spins.";

    return (
        <div
            className={`relative mt-2 rounded-md border px-4 py-3 text-sm flex items-start gap-3 ${
                isDeathMode
                    ? 'bg-red-950/80 border-red-700 text-red-100'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
            role="status"
        >
            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="flex-1">{tipText}</p>
            <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Dismiss tip"
                className="shrink-0 opacity-70 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
