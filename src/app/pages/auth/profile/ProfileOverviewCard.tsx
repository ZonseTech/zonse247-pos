import { FunctionComponent } from 'react';
import { BadgeCheckIcon } from 'lucide-react';
import { Card, Flex, Box, Text, Heading, Badge } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';

const formatRoleName = (role: string | null | undefined): string => {
    if (!role) return 'User';
    return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

type Props = {
    user: User | null;
};

const ProfileOverviewCard: FunctionComponent<Props> = ({ user }) => {
    return (
        <Card size="3">
            <Flex direction={{ initial: 'column', md: 'row' }} align={{ md: 'center' }} gap="6">
                <Box flexShrink="0">
                    <Avatar.Root className="w-24 h-24 rounded-full overflow-hidden inline-flex items-center justify-center bg-gradient-to-br from-sky-500 to-purple-600 shadow-lg">
                        <Avatar.Fallback className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                            {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar.Fallback>
                    </Avatar.Root>
                </Box>

                <Box flexGrow="1" minWidth="0">
                    <Flex align="center" gap="3" wrap="wrap">
                        <Heading as="h2" size="6" weight="bold">
                            {user?.fullname || 'User'}
                        </Heading>
                        <Badge
                            color={user?.status === 'active' ? 'green' : 'red'}
                            variant="soft"
                            size="1"
                        >
                            {user?.status?.charAt(0).toUpperCase() + (user?.status?.slice(1) || '')}
                        </Badge>
                    </Flex>
                    <Text as="p" size="2" color="gray" mt="1">@{user?.username}</Text>
                    <Flex align="center" gap="2" mt="2">
                        <BadgeCheckIcon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                        <Text size="2" weight="medium" color="sky">
                            {formatRoleName(user?.roleName)}
                        </Text>
                    </Flex>
                </Box>

                <Flex gap={{ initial: '4', md: '6' }} className="grid grid-cols-2">
                    <Box className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Text as="p" size="6" weight="bold">
                            {user?.permissions?.length || 0}
                        </Text>
                        <Text as="p" size="1" color="gray">Permissions</Text>
                    </Box>
                    <Box className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <Text as="p" size="6" weight="bold">
                            {user?.accessibleBranches?.includes('*')
                                ? 'All'
                                : user?.accessibleBranches?.length || 0}
                        </Text>
                        <Text as="p" size="1" color="gray">Branches</Text>
                    </Box>
                </Flex>
            </Flex>
        </Card>
    );
};

export default ProfileOverviewCard;
