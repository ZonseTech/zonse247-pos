import { FunctionComponent } from 'react';
import { LucideIcon } from 'lucide-react';
import { Flex, Box, Text } from '@radix-ui/themes';

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
};

const InfoItem: FunctionComponent<Props> = ({ icon: Icon, label, value }) => {
    return (
        <Flex align="center" gap="3" py="3">
            <Flex
                flexShrink="0"
                align="center"
                justify="center"
                className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/20"
            >
                <Icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            </Flex>
            <Box minWidth="0" flexGrow="1">
                <Text as="p" size="1" color="gray">{label}</Text>
                <Text as="p" size="2" weight="medium" truncate>{value}</Text>
            </Box>
        </Flex>
    );
};

export default InfoItem;
