import type { FunctionComponent, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Flex, Box, Text } from '@radix-ui/themes';

interface ActionRowProps {
    icon: ReactNode;
    label: string;
    description?: string;
    onTap: () => void;
    noBorder?: boolean;
    active?: boolean;
    showChevron?: boolean;
}

const ActionRow: FunctionComponent<ActionRowProps> = ({
    icon,
    label,
    description,
    onTap,
    noBorder = false,
    active = false,
    showChevron = false,
}) => (
    <Flex
        asChild
        align="center"
        px={{ initial: '4', sm: '5' }}
        py={{ initial: '3', sm: '4' }}
        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-50 dark:active:bg-gray-700 transition-colors ${!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''
            } ${active ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}
    >
        <button onClick={onTap} className="w-full flex items-center">
            <Box flexShrink="0" mr={{ initial: '3', sm: '4' }}>{icon}</Box>
            <Box flexGrow="1" className="text-left">
                <Text as="p" size="2" weight="medium" color={active ? 'sky' : undefined}>
                    {label}
                </Text>
                {description && (
                    <Text as="p" size="1" color="gray">{description}</Text>
                )}
            </Box>
            {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
        </button>
    </Flex>
);

export default ActionRow;
