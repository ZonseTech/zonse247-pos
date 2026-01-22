import { ElementType, useState } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

interface Tab {
    id: string;
    label: string;
    icon: ElementType;
}

interface SettingsTabsProps {
    tabs: Tab[];
    activeTab: "display" | "security" | "terminal" | "general" | "sales" | "backup" | "hardware"
    setActiveTab: (tab: 'general' | 'sales' | 'security' | 'backup') => void;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const ActiveIcon = activeTabData?.icon;

    const handleTabSelect = (id: string) => {
        setActiveTab(id as 'general' | 'sales' | 'security' | 'backup');
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile dropdown menu */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="w-full flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            {ActiveIcon && <ActiveIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {activeTabData?.label}
                            </span>
                        </div>
                        <HiOutlineChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {/* Mobile dropdown panel */}
                    {isMobileMenuOpen && (
                        <div className="absolute left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-20">
                            <div className="px-4 py-2">
                                {tabs.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => handleTabSelect(id)}
                                        className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${activeTab === id
                                            ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop horizontal tabs */}
                <div className="hidden md:flex gap-2 lg:gap-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as 'general' | 'sales' | 'security' | 'backup')}
                            className={`py-4 px-2 lg:px-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === id
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="hidden lg:inline">{label}</span>
                            <span className="lg:hidden">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsTabs;