import { FC } from 'react';
import { Clock, Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { Flex, Box, Text, Badge, Skeleton } from '@radix-ui/themes';
import usersService from '../../../services/users.service';

interface UserMobileCardProps {
    user: User;
    onEdit: (user: User) => void;
}

const getStatusBadgeColor = (status: UserStatus): 'green' | 'red' | 'yellow' | 'gray' => {
    const statusInfo = usersService.getStatusColor(status);
    if (statusInfo === 'green') return 'green';
    if (statusInfo === 'red') return 'red';
    if (statusInfo === 'yellow') return 'yellow';
    return 'gray';
};

const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const UserMobileCard: FC<UserMobileCardProps> = ({
    user,
    onEdit,
}) => {
    const formatSalary = () => {
        if (!user.staffSalary) return null;
        const salaryNum = parseFloat(String(user.staffSalary));
        if (isNaN(salaryNum)) return null;
        const formatted = salaryNum.toLocaleString();
        const suffix = user.calculateAs === 'hourly' ? '/hr' : user.calculateAs === 'daily' ? '/day' : '/mo';
        return `K${formatted}${suffix}`;
    };

    return (
        <button
            onClick={() => onEdit(user)}
            className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 text-left active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
        >
            <Flex align="center" gap="3">
                {/* Avatar */}
                <Flex
                    align="center"
                    justify="center"
                    flexShrink="0"
                    className="w-11 h-11 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full text-white font-semibold text-base shadow-sm"
                >
                    {getInitials(user.fullname || user.username || '')}
                </Flex>

                {/* User Info */}
                <Box flexGrow="1" minWidth="0">
                    <Flex justify="between" gap="2" mb="1">
                        <Box minWidth="0" flexGrow="1">
                            <Text as="p" size="3" weight="bold" truncate>
                                {user.fullname || user.username || 'Unknown User'}
                            </Text>
                            <Flex align="center" gap="2" wrap="wrap">
                                {(user.roleName || user.roleId) && (
                                    <Text size="1" weight="medium" color="sky">
                                        {user.roleName || user.roleId}
                                    </Text>
                                )}
                                {user.trackAttendance && (
                                    <Flex align="center" gap="1">
                                        <Clock className="w-3 h-3 text-amber-500" />
                                        <Text size="1" color="yellow">Tracked</Text>
                                    </Flex>
                                )}
                            </Flex>
                        </Box>
                        <Badge
                            size="1"
                            variant="soft"
                            color={getStatusBadgeColor(user.status)}
                        >
                            {user.status || 'unknown'}
                        </Badge>
                    </Flex>

                    {/* Staff Details Row */}
                    {(user.staffSalary || user.joiningDate) && (
                        <Flex align="center" gap="4" wrap="wrap" mt="1">
                            {formatSalary() && (
                                <Flex align="center" gap="1">
                                    <Briefcase className="w-3.5 h-3.5 text-green-500" />
                                    <Text size="2" weight="medium" color="green">
                                        {formatSalary()}
                                    </Text>
                                </Flex>
                            )}
                            {user.joiningDate && (
                                <Flex align="center" gap="1">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <Text size="1" color="gray">
                                        Joined {new Date(user.joiningDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </Text>
                                </Flex>
                            )}
                        </Flex>
                    )}
                </Box>

                {/* Chevron */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </Flex>
        </button>
    );
};

interface UserMobileListProps {
    users: User[];
    onEdit: (user: User) => void;
    isLoading?: boolean;
}

export const UserMobileList: FC<UserMobileListProps> = ({
    users,
    onEdit,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Flex direction="column" className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <Flex key={i} gap="3" p="4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Flex direction="column" gap="2" flexGrow="1">
                            <Skeleton className="h-4 w-1/2 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                            <Skeleton className="h-3 w-2/3 rounded" />
                        </Flex>
                    </Flex>
                ))}
            </Flex>
        );
    }

    return (
        <Flex direction="column" className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
                <UserMobileCard
                    key={user.userId}
                    user={user}
                    onEdit={onEdit}
                />
            ))}
        </Flex>
    );
};

export default UserMobileCard;
