import { posthog } from './posthog';
import { useAppStore } from './store';

const isVerbose = () => useAppStore.getState().verboseLogging;

const reportException = (args: unknown[]) => {
    if (typeof window === 'undefined') return;
    try {
        const errorArg = args.find((a): a is Error => a instanceof Error);
        const extras = args.filter(a => a !== errorArg);
        const exception = errorArg ?? new Error(args.map(a => String(a)).join(' ') || 'Logger.error called');
        posthog.captureException(exception, extras.length ? { extra: extras } : undefined);
    } catch {
        // Never let telemetry failures mask the original error.
    }
};

export const Logger = {
    log: (...args: unknown[]) => {
        if (isVerbose()) {
            console.log(...args);
        }
    },
    warn: (...args: unknown[]) => {
        if (isVerbose()) {
            console.warn(...args);
        }
    },
    error: (...args: unknown[]) => {
        console.error(...args);
        reportException(args);
    },
    info: (...args: unknown[]) => {
        if (isVerbose()) {
            console.info(...args);
        }
    },
    debug: (...args: unknown[]) => {
        if (isVerbose()) {
            console.debug(...args);
        }
    }
};
