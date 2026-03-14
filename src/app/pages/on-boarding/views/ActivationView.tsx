import { FunctionComponent } from 'react';
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
        <AuthLayout className="">
            <div className="space-y-4">
                {error && <ErrorAlert message={error} />}
                <TerminalActivationStep onSubmit={onSubmit} loading={loading} />
            </div>
        </AuthLayout>
    );
};

export default ActivationView;
