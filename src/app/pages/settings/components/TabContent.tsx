import { memo } from 'react';
import GeneralSettings from '../partials/GeneralSettings';
import TerminalSettings from '../partials/TerminalSettings';
import SalesSettings from '../partials/SalesSettings';
import DisplaySettings from '../partials/DisplaySettings';
import HardwareSettings from '../partials/HardwareSettings';
import SecuritySettings from '../partials/SecuritySettings';
import BackupSettings from '../partials/BackupSettings';
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
        case 'terminal':
            return <TerminalSettings />;
        case 'sales':
            return <SalesSettings />;
        case 'display':
            return <DisplaySettings />;
        case 'hardware':
            return <HardwareSettings />;
        case 'security':
            return <SecuritySettings />;
        case 'backup':
            return <BackupSettings />;
        default:
            return <GeneralSettings />;
    }
}, (prevProps, nextProps) => {
    return prevProps.activeTab === nextProps.activeTab;
});

TabContent.displayName = 'TabContent';

export default TabContent;
