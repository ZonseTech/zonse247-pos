import { FunctionComponent } from 'react';
import { ClockIcon } from 'lucide-react';
import { Card, Flex, Box, Text, Heading } from '@radix-ui/themes';
import * as Separator from '@radix-ui/react-separator';

const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

type Props = {
    user: User | null;
};

const ActivityItem = ({ label, value }: { label: string; value: string }) => (
    <Flex align="center" justify="between" py="2">
        <Text size="2" color="gray">{label}</Text>
        <Text size="2" weight="medium">{value}</Text>
    </Flex>
);

const ActivityCard: FunctionComponent<Props> = ({ user }) => {
    return (
        <Card size="3">
            <Flex align="center" gap="2" mb="4">
                <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <Heading as="h3" size="4" weight="bold">
                    Activity
                </Heading>
            </Flex>
            <Flex direction="column" gap="4">
                <ActivityItem label="Last Login" value={formatDate(user?.lastLogin)} />
                <ActivityItem label="Last Logout" value={formatDate(user?.lastLogout)} />
                <ActivityItem label="Password Changed" value={formatDate(user?.passwordChangedAt)} />
                <ActivityItem label="Account Created" value={formatDate(user?.createdAt)} />
            </Flex>
        </Card>
    );
};

export default ActivityCard;
