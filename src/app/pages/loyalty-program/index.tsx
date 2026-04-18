import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { HiOutlineHeart } from 'react-icons/hi2';
import { Notify } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useIsMobile } from '../../hooks/useMediaQuery';
import loyaltyService from '../../services/loyalty.service';
import ProgramSettings from './partials/ProgramSettings';
import TierManagement from './partials/TierManagement';
import MembersList from './partials/MembersList';
import EmptyProgramNotice from './partials/EmptyProgramNotice';

const TABS = [
    { id: 'settings', label: 'Program' },
    { id: 'tiers', label: 'Tiers' },
    { id: 'members', label: 'Members' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const LoyaltyProgramPage: FunctionComponent = () => {
    const [activeTab, setActiveTab] = useState<TabId>('settings');
    const [program, setProgram] = useState<LoyaltyProgram | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();

    const loadProgram = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await loyaltyService.getProgram();
            setProgram(data);
        } catch {
            Notify.failure('Failed to load loyalty program');
            setProgram(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProgram();
    }, [loadProgram]);

    const tabTriggerClass =
        'flex-shrink-0 flex-1 md:flex-initial px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 outline-none cursor-pointer whitespace-nowrap text-center ' +
        'text-gray-500 dark:text-gray-400 border-transparent ' +
        'hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 ' +
        'data-[state=active]:text-sky-500 dark:data-[state=active]:text-sky-400 ' +
        'data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400';

    return (
        <AppLayout>
            {isMobile ? (
                <MobilePageHeader title="Loyalty Program" />
            ) : (
                <PageHeader
                    title="Loyalty Program"
                    description="Configure rewards, tiers, and manage members"
                    icon={<HiOutlineHeart className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                />
            )}

            <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
                <Tabs.List className="-mx-4 md:-mx-6 px-4 md:px-6 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 gap-0 scrollbar-none mb-4">
                    {TABS.map((tab) => (
                        <Tabs.Trigger key={tab.id} value={tab.id} className={tabTriggerClass}>
                            {tab.label}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                <Tabs.Content value="settings">
                    <ProgramSettings program={program} isLoading={isLoading} onSaved={loadProgram} />
                </Tabs.Content>

                <Tabs.Content value="tiers">
                    {program ? (
                        <TierManagement program={program} />
                    ) : (
                        <EmptyProgramNotice loading={isLoading} context="tiers" onGoToSetup={() => setActiveTab('settings')} />
                    )}
                </Tabs.Content>

                <Tabs.Content value="members">
                    {program ? (
                        <MembersList program={program} />
                    ) : (
                        <EmptyProgramNotice loading={isLoading} context="members" onGoToSetup={() => setActiveTab('settings')} />
                    )}
                </Tabs.Content>
            </Tabs.Root>
        </AppLayout>
    );
};

export default LoyaltyProgramPage;
