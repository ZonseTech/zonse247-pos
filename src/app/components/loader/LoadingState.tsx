import { FunctionComponent } from 'react';
import { Flex, Text, Spinner } from '@radix-ui/themes';

const LoadingState: FunctionComponent = () => {
    return (
        <Flex direction="column" align="center" justify="center" py="9">
            <Spinner size="3" />
            <Text size="2" color="gray" mt="4">Loading sales...</Text>
        </Flex>
    );
};

export default LoadingState;
