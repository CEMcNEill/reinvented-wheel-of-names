import { useAppStore } from './store';

const isVerbose = () => useAppStore.getState().verboseLogging;

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
        // Errors might be critical, but the user asked to "hide everything" behind the flag.
        // I will respect the flag for errors too as per instruction "hide everything".
        if (isVerbose()) {
            console.error(...args);
        }
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
