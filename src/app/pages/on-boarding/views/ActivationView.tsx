import { FunctionComponent } from 'react';
import AuthLayout from '../../../layouts/AuthLayout';
import StepIndicator from '../partials/StepIndicator';
import ErrorAlert from '../partials/ErrorAlert';
import TerminalActivationStep from '../steps/TerminalActivationStep';
import type { ActivationViewProps } from '../types';

const ActivationView: FunctionComponent<ActivationViewProps> = ({
    error,
    loading,
    onSubmit,
}) => {
    return (
        <AuthLayout className="">
            <StepIndicator currentStep={1} totalSteps={8} onBack={null}>
                {error && <ErrorAlert message={error} />}
                <TerminalActivationStep onSubmit={onSubmit} loading={loading} />
            </StepIndicator>
        </AuthLayout>
    );
};

export default ActivationView;
