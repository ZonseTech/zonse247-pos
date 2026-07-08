import { useMemo } from 'react';
import { useIsEBN } from '../../../hooks/useMediaQuery';
import { useKeyboardSettings } from '../../../hooks/useKeyboardSettings';
import { useLayout } from '../../../context/LayoutContext';
import { isElectron } from '../../../../helpers/index.helper';
import useBusinessFeatures from '../../../hooks/useBusinessFeatures';

const CLIENT_TYPE = import.meta.env.VITE_APP_CLIENT_TYPE || 'desktop'

type PanelSize = '1' | '1/2' | '1/3' | '1/4' | '1/5' | '1/6' | '2/3' | '2/4' | '2/5' | '3/4' | '3/5' | '4/5' | '5/6' | 'full';

export type POSMode = 'retail' | 'service';

export interface POSLayoutConfig {
    mode: POSMode;
    header: {
        label: PanelSize;
        total: PanelSize;
    };
    main: {
        cart: PanelSize;
        numpad: PanelSize;
    };
    footer: {
        scanner: PanelSize;
        counter: PanelSize;
    };
    /** For service mode: left column (cart side) vs right column (catalog side) */
    columns: {
        left: PanelSize;
        right: PanelSize;
    };
    compact: boolean;
    showNumpad: boolean;
    showCatalog: boolean;
    isSidebarVisible: boolean;
}

type LayoutPreset = Omit<POSLayoutConfig, 'isSidebarVisible'>;

const LAYOUT_COMPACT_KEYBOARD: LayoutPreset = {
    mode: 'retail',
    header: { label: '1/2', total: '1/2' },
    main: { cart: '2/3', numpad: '1/3' },
    footer: { scanner: '2/3', counter: '1/3' },
    columns: { left: 'full', right: 'full' },
    compact: true,
    showNumpad: true,
    showCatalog: false,
};

const LAYOUT_COMPACT_NO_KEYBOARD: LayoutPreset = {
    mode: 'retail',
    header: { label: '1/2', total: '1/2' },
    main: { cart: '3/4', numpad: '1/4' },
    footer: { scanner: '3/4', counter: '1/4' },
    columns: { left: 'full', right: 'full' },
    compact: true,
    showNumpad: false,
    showCatalog: false,
};

const LAYOUT_STANDARD_KEYBOARD: LayoutPreset = {
    mode: 'retail',
    header: { label: '1/2', total: '1/2' },
    main: { cart: '3/4', numpad: '1/4' },
    footer: { scanner: '3/4', counter: '1/4' },
    columns: { left: 'full', right: 'full' },
    compact: false,
    showNumpad: true,
    showCatalog: false,
};

const LAYOUT_STANDARD_NO_KEYBOARD: LayoutPreset = {
    mode: 'retail',
    header: { label: '1/2', total: '1/2' },
    main: { cart: '3/4', numpad: '1/4' },
    footer: { scanner: '3/4', counter: '1/4' },
    columns: { left: 'full', right: 'full' },
    compact: false,
    showNumpad: false,
    showCatalog: false,
};

/** Service mode: split layout with catalog on the right */
const LAYOUT_SERVICE_STANDARD: LayoutPreset = {
    mode: 'service',
    header: { label: '1/2', total: '1/2' },
    main: { cart: 'full', numpad: '1/4' },
    footer: { scanner: '3/4', counter: '1/4' },
    columns: { left: '1/2', right: '1/2' },
    compact: false,
    showNumpad: false,
    showCatalog: true,
};

const LAYOUT_SERVICE_COMPACT: LayoutPreset = {
    mode: 'service',
    header: { label: '1/2', total: '1/2' },
    main: { cart: 'full', numpad: '1/4' },
    footer: { scanner: '2/3', counter: '1/3' },
    columns: { left: '1/2', right: '1/2' },
    compact: true,
    showNumpad: false,
    showCatalog: true,
};

export const POS_LAYOUTS = {
    COMPACT_KEYBOARD: LAYOUT_COMPACT_KEYBOARD,
    COMPACT_NO_KEYBOARD: LAYOUT_COMPACT_NO_KEYBOARD,
    STANDARD_KEYBOARD: LAYOUT_STANDARD_KEYBOARD,
    STANDARD_NO_KEYBOARD: LAYOUT_STANDARD_NO_KEYBOARD,
    SERVICE_STANDARD: LAYOUT_SERVICE_STANDARD,
    SERVICE_COMPACT: LAYOUT_SERVICE_COMPACT,
} as const;

export function usePOSLayout(overrides?: Partial<POSLayoutConfig>): POSLayoutConfig {
    const isEBN = useIsEBN();
    const { enabled: keyboardEnabled } = useKeyboardSettings();
    const { isSidebarHidden } = useLayout();
    const { showRetail } = useBusinessFeatures();

    return useMemo(() => {
        let base: LayoutPreset;

        if (!showRetail) {
            // Service/non-retail mode
            base = isEBN ? LAYOUT_SERVICE_COMPACT : LAYOUT_SERVICE_STANDARD;
        } else if (isEBN && keyboardEnabled) {
            base = LAYOUT_COMPACT_KEYBOARD;
        } else if (isEBN) {
            base = LAYOUT_COMPACT_NO_KEYBOARD;
        } else if (keyboardEnabled) {
            base = LAYOUT_STANDARD_KEYBOARD;
        } else {
            base = LAYOUT_STANDARD_NO_KEYBOARD;
        }

        const isDesktopEnv = isElectron() || CLIENT_TYPE === 'desktop'
        const isSidebarVisible = !isDesktopEnv && !isSidebarHidden;

        return { ...base, isSidebarVisible, ...overrides };
    }, [isEBN, keyboardEnabled, isSidebarHidden, showRetail, overrides]);
}
