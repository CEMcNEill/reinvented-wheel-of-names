'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface AdHocInputProps {
    onNavigateUp?: () => void;
    onNavigateDown?: () => void;
}

export function AdHocInput({ onNavigateUp, onNavigateDown }: AdHocInputProps) {
    const {
        adHocNames, setAdHocNames,
        triggerSpin,
        winner,
        mode
    } = useAppStore();

    const [text, setText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local text with store on mount
    useEffect(() => {
        if (adHocNames.length > 0) {
            setTimeout(() => {
                setText(adHocNames.join(', '));
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Focus input when mode becomes 'adhoc'
    useEffect(() => {
        if (mode === 'adhoc' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [mode]);

    const parseNames = (input: string) => {
        return input
            .split(/[\n,]/) // Split by newline or comma
            .map(name => name.trim())
            .filter(name => name.length > 0);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        setText(newText);
        const names = parseNames(newText);
        setAdHocNames(names);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (winner) return;
            e.preventDefault();
            triggerSpin();
            return;
        }

        const input = e.currentTarget;
        const { selectionStart, selectionEnd, value } = input;

        if (e.key === 'ArrowUp') {
            // Navigate up if cursor is at start or text is empty
            if (selectionStart === 0 && selectionEnd === 0) {
                e.preventDefault();
                onNavigateUp?.();
            }
        } else if (e.key === 'ArrowDown') {
            // Navigate down if cursor is at end or text is empty
            if (selectionStart === value.length && selectionEnd === value.length) {
                e.preventDefault();
                onNavigateDown?.();
            }
        }
    };

    const handleClear = () => {
        setText('');
        setAdHocNames([]);
    };

    return (
        <Card className="w-full relative group">
            <div className="absolute top-2 right-2 flex gap-1 z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); handleClear(); }}
                    title="Clear List"
                >
                    <Trash2 size={14} />
                </Button>
            </div>
            <CardHeader className="pb-2 pt-6">
                <CardTitle className="text-lg pr-16">Quick List</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Input
                    ref={inputRef}
                    id="adhoc-input"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter names separated by commas, enter to spin"
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    className="bg-card border-input focus-visible:ring-ring text-base p-3 h-auto min-h-[44px] text-foreground"
                />
            </CardContent>
        </Card>
    );
}
