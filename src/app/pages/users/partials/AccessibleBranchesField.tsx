import { FunctionComponent, useEffect, useState } from 'react';
import { Box, Checkbox, Flex, Switch, Text } from '@radix-ui/themes';
import branchService from '../../../services/branch.service';

interface AccessibleBranchesFieldProps {
    tenantId: string;
    primaryBranchId: string;
    value: string[];
    allBranches: boolean;
    onChange: (value: string[]) => void;
    onAllBranchesChange: (allBranches: boolean) => void;
}

const AccessibleBranchesField: FunctionComponent<AccessibleBranchesFieldProps> = ({
    tenantId,
    primaryBranchId,
    value,
    allBranches,
    onChange,
    onAllBranchesChange,
}) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tenantId) {
            setBranches([]);
            return;
        }
        setLoading(true);
        branchService.list({ tenantId })
            .then(setBranches)
            .catch(() => setBranches([]))
            .finally(() => setLoading(false));
    }, [tenantId]);

    const otherBranches = branches.filter((b) => b.branchId !== primaryBranchId);

    const toggleBranch = (branchId: string, checked: boolean) => {
        onChange(checked ? [...value, branchId] : value.filter((id) => id !== branchId));
    };

    return (
        <Box>
            <Text as="label" size="2" weight="medium" mb="1" className="block">
                Additional Branch Access
            </Text>
            <Text as="p" size="1" color="gray" mb="2">
                Staff always has access to their primary branch. Grant access to more branches below.
            </Text>

            <Flex asChild align="center" justify="between" gap="3" mb="2" p="2" className="rounded-lg border border-gray-200 dark:border-gray-700">
                <label className="cursor-pointer">
                    <Text size="2" weight="medium">All branches</Text>
                    <Switch checked={allBranches} onCheckedChange={onAllBranchesChange} size="2" />
                </label>
            </Flex>

            {!allBranches && (
                loading ? (
                    <Text as="p" size="1" color="gray">Loading branches...</Text>
                ) : !tenantId ? (
                    <Text as="p" size="1" color="gray">Select a tenant first</Text>
                ) : otherBranches.length === 0 ? (
                    <Text as="p" size="1" color="gray">No other branches in this tenant</Text>
                ) : (
                    <Flex direction="column" gap="2" p="2" className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        {otherBranches.map((branch) => (
                            <Flex asChild key={branch.branchId} align="center" gap="2">
                                <label className="cursor-pointer">
                                    <Checkbox
                                        checked={value.includes(branch.branchId)}
                                        onCheckedChange={(checked) => toggleBranch(branch.branchId, checked === true)}
                                    />
                                    <Text size="2">{branch.branchName}</Text>
                                </label>
                            </Flex>
                        ))}
                    </Flex>
                )
            )}
        </Box>
    );
};

export default AccessibleBranchesField;
