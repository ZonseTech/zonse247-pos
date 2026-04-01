import { FunctionComponent } from 'react';
import { Receipt } from 'lucide-react';
import { Flex, Heading, Text } from '@radix-ui/themes';

const SalesEmptyState: FunctionComponent = () => {
    return (
        <Flex direction="column" align="center" justify="center" py="9" px="4">
            <Flex
                align="center"
                justify="center"
                mb="4"
                className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full"
            >
                <Receipt className="w-8 h-8 text-gray-400" />
            </Flex>
            <Heading as="h3" size="3" weight="medium" mb="2" align="center">
                No sales today
            </Heading>
            <Text as="p" size="2" color="gray" align="center">
                Sales made today will appear here
            </Text>
        </Flex>
    );
};

export default SalesEmptyState;
