import type { FunctionComponent, ReactNode } from 'react';
import { Flex, Box, Text } from '@radix-ui/themes';

interface InfoRowProps {
    icon: ReactNode;
    label: string;
    value: string;
    noBorder?: boolean;
}

const InfoRow: FunctionComponent<InfoRowProps> = ({ icon, label, value, noBorder = false }) => (
    <Flex
        align="center"
        px={{ initial: '0', }}
        py={{ initial: '3', sm: '4' }}
        className={!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''}
    >
        <Box flexShrink="0" mr={{ initial: '3', sm: '4' }}>{icon}</Box>
        <Box flexGrow="1" minWidth="0">
            <Text as="p" size="1" color="gray">{label}</Text>
            <Text as="p" size="2" weight="medium" truncate>{value}</Text>
        </Box>
    </Flex>
);

export default InfoRow;
