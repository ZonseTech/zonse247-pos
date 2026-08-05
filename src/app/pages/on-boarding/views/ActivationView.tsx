import { FunctionComponent } from 'react';
import { Box, Flex } from '@radix-ui/themes';
import AuthLayout from '../../../layouts/AuthLayout';
import ErrorAlert from '../partials/ErrorAlert';
import TerminalActivationStep from '../steps/TerminalActivationStep';
import type { ActivationViewProps } from '../types';

const ActivationView: FunctionComponent<ActivationViewProps> = ({
    error,
    loading,
    onSubmit,
}) => {
    return (
        <AuthLayout className="w-full max-w-xl">
            <Box className="w-full">
                <Flex direction="column" gap="4">
                    {error && <ErrorAlert message={error} />}
                    <TerminalActivationStep onSubmit={onSubmit} loading={loading} />
                </Flex>
            </Box>
        </AuthLayout>
    );
};

export default ActivationView;
