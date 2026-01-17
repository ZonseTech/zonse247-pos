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

/**
 * Hook to detect EBN Aures all-in-one POS terminal
 * EBN devices typically have screens between 1024x768 and 1280x1024
 * This hook detects medium-sized screens that are not mobile but need compact layouts
 */
export const useIsEBN = (): boolean => {
    return useMediaQuery('(min-width: 768px) and (max-width: 1366px) and (max-height: 900px)');
};

/**
 * Hook to check if the device is a large desktop screen (above EBN range)
 */
export const useIsLargeScreen = (): boolean => {
    return useMediaQuery('(min-width: 1367px) or (min-height: 901px)');
};

export default useMediaQuery;
