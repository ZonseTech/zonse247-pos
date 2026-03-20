import { useEffect, useRef, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity

/**
 * Detects user inactivity and tells the server to mark this terminal
 * as `idle`.  When the user interacts again the terminal is set back
 * to `online`.
 *
 * Must be rendered inside a `<SocketProvider>`.
 *
 * @see WEBSOCKET_FRONTEND_GUIDE.md §9
 */
export function useIdleDetection() {
    const { setTerminalIdle, setTerminalActive, isConnected } = useSocketContext();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isIdleRef = useRef(false);

    const resetTimer = useCallback(() => {
        if (!isConnected) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        if (isIdleRef.current) {
            isIdleRef.current = false;
            setTerminalActive();
        }

        timerRef.current = setTimeout(() => {
            isIdleRef.current = true;
            setTerminalIdle();
        }, IDLE_TIMEOUT);
    }, [isConnected, setTerminalIdle, setTerminalActive]);

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        resetTimer();

        return () => {
            events.forEach((event) => document.removeEventListener(event, resetTimer));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [resetTimer]);
}
