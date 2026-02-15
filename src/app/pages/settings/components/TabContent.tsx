import { memo } from 'react';
import GeneralSettings from '../partials/GeneralSettings';
import SalesSettings from '../partials/SalesSettings';
import ReceiptSettings from '../partials/ReceiptSettings';
import SecuritySettings from '../partials/SecuritySettings';
import type { SettingsTabId } from '../constants/config';

interface TabContentProps {
    activeTab: SettingsTabId;
}

/**
 * Tab content component with memoization
 * Only re-renders when activeTab changes
 */
const TabContent = memo<TabContentProps>(({ activeTab }) => {
    switch (activeTab) {
        case 'general':
            return <GeneralSettings />;
        case 'sales':
            return <SalesSettings />;
        case 'receipt':
            return <ReceiptSettings />;
        case 'security':
            return <SecuritySettings />;
        default:
            return <GeneralSettings />;
    }
}, (prevProps, nextProps) => {
    return prevProps.activeTab === nextProps.activeTab;
});

TabContent.displayName = 'TabContent';

export default TabContent;
