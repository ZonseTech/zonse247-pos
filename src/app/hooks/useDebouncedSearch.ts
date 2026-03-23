import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook that provides a local search term for responsive UI updates
 * and a debounced value for triggering expensive operations (API calls).
 *
 * @param delay - Debounce delay in ms (default 300)
 * @returns { searchTerm, debouncedTerm, setSearchTerm, clearSearch }
 */
export const useDebouncedSearch = (delay = 300) => {
    const [searchTerm, setSearchTermLocal] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const setSearchTerm = useCallback(
        (value: string) => {
            setSearchTermLocal(value);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setDebouncedTerm(value);
            }, delay);
        },
        [delay],
    );

    const clearSearch = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setSearchTermLocal('');
        setDebouncedTerm('');
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { searchTerm, debouncedTerm, setSearchTerm, clearSearch };
};
