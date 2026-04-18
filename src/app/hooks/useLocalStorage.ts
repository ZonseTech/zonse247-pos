import { useState, useCallback, useEffect } from 'react';

/**
 * A hook that syncs React state with localStorage.
 *
 * - Lazy-initialises from storage on mount.
 * - Writes through to storage on every state change.
 * - Listens for `storage` events so tabs/windows stay in sync.
 *
 * @param key  The localStorage key.
 * @param defaultValue  Value returned when nothing is stored yet.
 */
function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? (JSON.parse(item) as T) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue(prev => {
                const next = value instanceof Function ? value(prev) : value;
                try {
                    window.localStorage.setItem(key, JSON.stringify(next));
                } catch {
                    // Storage full or blocked — state still updates in-memory
                }
                return next;
            });
        },
        [key],
    );

    // Keep in sync when the same key is changed in another tab/window
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key !== key) return;
            try {
                setStoredValue(e.newValue !== null ? JSON.parse(e.newValue) : defaultValue);
            } catch {
                setStoredValue(defaultValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [key, defaultValue]);

    return [storedValue, setValue];
}

export default useLocalStorage;
