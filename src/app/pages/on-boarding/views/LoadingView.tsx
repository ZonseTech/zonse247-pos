import { FunctionComponent } from 'react';
import { Box, Card, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import AuthLayout from '../../../layouts/AuthLayout';

interface LoadingViewProps {
    message?: string;
}

/**
 * Loading view - displays a polished loading state while initializing
 */
const LoadingView: FunctionComponent<LoadingViewProps> = ({
    message = 'Checking onboarding status...',
}) => {
    return (
        <AuthLayout className="w-full max-w-xl">
            <Card size="2" className="border border-slate-200/80 bg-[color:var(--color-panel)] shadow-sm">
                <Flex direction="column" align="center" justify="center" gap="3" py="6">
                    <Box className="rounded-full bg-sky-50 p-4 dark:bg-sky-950/30">
                        <Spinner size="3" />
                    </Box>
                    <Heading as="h2" size="4">
                        Preparing your setup
                    </Heading>
                    <Text size="2" color="gray" align="center">
                        {message}
                    </Text>
                    <Text size="1" color="gray" align="center">
                        This usually takes only a few moments.
                    </Text>
                </Flex>
            </Card>
        </AuthLayout>
    );
};

export default LoadingView;
