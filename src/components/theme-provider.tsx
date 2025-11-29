'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return <>{children}</>;
}
