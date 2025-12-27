import { useState, useEffect } from 'react';

/**
 * Custom hook to track media query matches
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        const handleChange = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        setMatches(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
};

/**
 * Hook to check if the screen is mobile size (below md breakpoint: 768px)
 */
export const useIsMobile = (): boolean => {
    return useMediaQuery('(max-width: 767px)');
};

/**
 * Hook to check if the screen is tablet size or larger (md breakpoint: 768px+)
 */
export const useIsDesktop = (): boolean => {
    return useMediaQuery('(min-width: 768px)');
};

export default useMediaQuery;
