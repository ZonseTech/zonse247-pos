import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router';
import { Notify } from 'notiflix';
import { Switch, Text, Flex } from '@radix-ui/themes';
import branchService from '../../services/branch.service';
import { useBranch } from '../../context/BranchContext';
import { HIDEABLE_NAV_ITEMS } from '../../navigation/hideableNavItems';
import { getErrorMessage } from '../../utils/api-error-handler';

interface SettingsOutletContext {
    registerTabSubmit: (fn: (() => Promise<void>) | null) => void;
}

const NavigationSettingsPage: FunctionComponent = () => {
    const { currentBranch, refreshBranches } = useBranch();
    const { registerTabSubmit } = useOutletContext<SettingsOutletContext>();

    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setHiddenIds(new Set(currentBranch?.branchPreferences?.navigation?.hiddenNavItemIds ?? []));
    }, [currentBranch?.branchId]);

    const handleToggle = (itemId: string, visible: boolean) => {
        setHiddenIds((prev) => {
            const next = new Set(prev);
            if (visible) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const handleSave = useCallback(async () => {
        if (!currentBranch?.branchId) return;

        try {
            await branchService.updatePreferences(currentBranch.branchId, {
                navigation: { hiddenNavItemIds: Array.from(hiddenIds) },
            });
            await refreshBranches();
            Notify.success('Navigation preferences saved.');
        } catch (error: any) {
            console.error('Error saving navigation preferences:', error);
            Notify.failure(getErrorMessage(error, 'Failed to save navigation preferences'));
        }
    }, [currentBranch, hiddenIds, refreshBranches]);

    useEffect(() => {
        registerTabSubmit(handleSave);
        return () => registerTabSubmit(null);
    }, [registerTabSubmit, handleSave]);

    return (
        <div className="bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {HIDEABLE_NAV_ITEMS.map((item) => (
                    <Flex key={item.id} align="center" justify="between" px="4" py="3">
                        <Text size="2" weight="medium">
                            {item.label}
                        </Text>
                        <Switch
                            checked={!hiddenIds.has(item.id)}
                            onCheckedChange={(checked) => handleToggle(item.id, checked)}
                        />
                    </Flex>
                ))}
            </div>
        </div>
    );
};

export default NavigationSettingsPage;
