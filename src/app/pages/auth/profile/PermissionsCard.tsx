import { FunctionComponent, useMemo } from 'react';
import { ShieldIcon } from 'lucide-react';
import { Card, Flex, Box, Text, Heading, Badge } from '@radix-ui/themes';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    permissions: string[] | null | undefined;
};

const groupPermissions = (permissions: string[] | null | undefined): Record<string, string[]> => {
    if (!permissions) return {};
    return permissions.reduce(
        (acc, perm) => {
            const [category] = perm.split('.');
            if (!acc[category]) acc[category] = [];
            acc[category].push(perm);
            return acc;
        },
        {} as Record<string, string[]>
    );
};

const PermissionsCard: FunctionComponent<Props> = ({ permissions }) => {
    const [open, setOpen] = useState(false);

    const groupedPermissions = useMemo(
        () => groupPermissions(permissions),
        [permissions]
    );

    return (
        <Card size="3">
            <Collapsible.Root open={open} onOpenChange={setOpen}>
                <Collapsible.Trigger asChild>
                    <button type="button" className="w-full">
                        <Flex align="center" justify="between">
                            <Flex align="center" gap="2">
                                <ShieldIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <Heading as="h3" size="4" weight="bold">
                                    Permissions
                                </Heading>
                                <Badge variant="soft" size="1">
                                    {permissions?.length || 0}
                                </Badge>
                            </Flex>
                            {open ? (
                                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                            )}
                        </Flex>
                    </button>
                </Collapsible.Trigger>

                <Collapsible.Content>
                    <Box mt="6" className="space-y-4">
                        {Object.entries(groupedPermissions).map(([category, perms]) => (
                            <Box key={category}>
                                <Text as="p" size="2" weight="bold" color="gray" className="capitalize mb-2">
                                    {category}
                                </Text>
                                <Flex wrap="wrap" gap="2">
                                    {perms.map((perm) => (
                                        <Badge key={perm} variant="soft" color="gray" size="1">
                                            {perm.split('.').slice(1).join('.')}
                                        </Badge>
                                    ))}
                                </Flex>
                            </Box>
                        ))}
                    </Box>
                </Collapsible.Content>
            </Collapsible.Root>
        </Card>
    );
};

export default PermissionsCard;
