'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
    id: string;
    title: string;
    body: string;
}

const SLIDES: Slide[] = [
    {
        id: 'spin',
        title: 'Spin to pick a winner',
        body: 'Hit SPIN or press Enter to draw a random name from your list.',
    },
    {
        id: 'teams',
        title: 'Save your teams',
        body: 'Group the names you spin often — switch between teams in one click.',
    },
    {
        id: 'highlander',
        title: 'Highlander Mode',
        body: 'Eliminate the winner each round until one name remains. There can be only one.',
    },
];

export function FeatureCarousel() {
    const posthog = usePostHog();
    const [index, setIndex] = useState(0);

    const goTo = useCallback((next: number, source: 'click' | 'keyboard' | 'dot') => {
        const normalized = ((next % SLIDES.length) + SLIDES.length) % SLIDES.length;
        setIndex(normalized);
        const slide = SLIDES[normalized];
        posthog.capture('feature_carousel_slide_viewed', {
            slide_number: normalized + 1,
            slide_id: slide.id,
            total_slides: SLIDES.length,
            source,
        });
    }, [posthog]);

    useEffect(() => {
        const slide = SLIDES[0];
        posthog.capture('feature_carousel_slide_viewed', {
            slide_number: 1,
            slide_id: slide.id,
            total_slides: SLIDES.length,
            source: 'initial',
        });
    }, [posthog]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }
            if (e.key === 'ArrowRight') {
                goTo(index + 1, 'keyboard');
            } else if (e.key === 'ArrowLeft') {
                goTo(index - 1, 'keyboard');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goTo, index]);

    const slide = SLIDES[index];

    return (
        <section
            aria-label="Feature highlights"
            aria-roledescription="carousel"
            className="rounded-[var(--radius)] border-2 border-dashed border-border bg-muted/30 backdrop-blur-sm"
        >
            <div className="flex items-stretch">
                <button
                    type="button"
                    onClick={() => goTo(index - 1, 'click')}
                    aria-label="Previous slide"
                    className="px-3 flex items-center hover:bg-muted/50 rounded-l-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => goTo(index + 1, 'click')}
                    aria-label="Next slide"
                    aria-live="polite"
                    className="flex-1 px-4 py-4 text-left focus:outline-none focus:ring-2 focus:ring-ring rounded-none"
                >
                    <h3 className="font-heading text-lg font-semibold leading-tight">{slide.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{slide.body}</p>
                </button>
                <button
                    type="button"
                    onClick={() => goTo(index + 1, 'click')}
                    aria-label="Next slide"
                    className="px-3 flex items-center hover:bg-muted/50 rounded-r-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
            <div className="flex justify-center gap-2 pb-3" role="tablist" aria-label="Slide navigation">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.id}
                        type="button"
                        role="tab"
                        aria-selected={i === index}
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => goTo(i, 'dot')}
                        className={`h-2 w-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${i === index ? 'bg-foreground' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'}`}
                    />
                ))}
            </div>
        </section>
    );
}
