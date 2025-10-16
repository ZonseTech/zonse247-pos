import { ElementType } from 'react';

interface Tab {
    id: string;
    label: string;
    icon: ElementType;
}

interface SettingsTabsProps {
    tabs: Tab[];
    activeTab: 'general' | 'sales' | 'security' | 'backup';
    setActiveTab: (tab: 'general' | 'sales' | 'security' | 'backup') => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-8 border-b border-gray-200 dark:border-gray-700">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as 'general' | 'sales' | 'security' | 'backup')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsTabs;