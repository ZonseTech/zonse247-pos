import * as Yup from 'yup';
import ErrorAlert from './partials/ErrorAlert';
import AuthLayout from '../../layouts/AuthLayout';
import { FunctionComponent, useState } from 'react';
import StepIndicator from './partials/StepIndicator';
import branchService from '../../services/branch.service';
import tenantService from '../../services/tenant.service';
import terminalService from '../../services/terminal.service';
import BranchSelectionStep from './steps/BranchSelectionStep';
import TerminalSelectionStep from './steps/TerminalSelectionStep';
import TenantVerificationStep from './steps/TenantVerificationStep';
import { toast } from 'react-toastify';

interface OnboardingFlowProps {
    onComplete: (setupData: any) => void;
    error?: string | null;
}

const OnboardingFlow: FunctionComponent<OnboardingFlowProps> = ({ onComplete, error: parentError }) => {
    const registerProps: TerminalVerificationParams = {
        verificationToken: '3f81127ca4ba63eb4902be2696970d568dea:b1c00587834336e5a45dd2758536449a',
        os: '',
        hostname: '',
        macAddress: ''
    }

    const registerValidationSchema: Yup.ObjectSchema<{
        verificationToken: string;
    }, Yup.AnyObject, {
        verificationToken: undefined;
    }, ""> = Yup.object({
        verificationToken: Yup.string()
            .required('Verification token is required'),
    })

    const [localError, setLocalError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [branches, setTenantBranches] = useState<Array<Branch>>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch>(null);
    const [verifiedTenant, setVerifiedTenant] = useState<Tenant>(null);
    const [terminals, setTerminals] = useState<Array<Terminal>>([]);
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal>(null);

    const displayError = parentError || localError;

    const handleVerifyClient = async (credentials: TerminalVerificationParams) => {
        setLocalError('');

        try {
            const tenant = await tenantService.verify(credentials);
            setVerifiedTenant(tenant);
            setSuccess(`Welcome, ${tenant.businessName}!`);
            setCurrentStep(2);

            await fetchBranchesByTenantId(tenant.tenantId);
        } catch (err) {
            setLocalError((err as any)?.error?.response?.data?.message || 'Verification failed. Please check your credentials.');
        }
    };

    const fetchBranchesByTenantId = async (tenantId: string) => {
        setLoading(true);
        try {
            const response = await branchService.listByTenantId(tenantId);
            setTenantBranches(response.data);
        } catch (err) {
            setLocalError('Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    const handleBranchSelect = async (branch: Branch) => {
        setSelectedBranch(branch);
        setLocalError('');
        setLoading(true);

        try {
            const stationsList = await terminalService.listByBranchId(branch.branchId);
            setTerminals(stationsList);
            setCurrentStep(3);
        } catch (err) {
            setLocalError('Failed to fetch terminals for the selected branch');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminalSelect = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        setLocalError('');
    };

    const handleSubmitConfiguration = async () => {
        if (!selectedTerminal) {
            setLocalError('Please select a terminal');
            return;
        }

        setLoading(true);
        setLocalError('');

        try {
            const params = {
                verificationToken: registerProps.verificationToken,
                tenantId: verifiedTenant.tenantId,
                branchId: selectedBranch.branchId,
                terminalId: selectedTerminal.terminalId
            }

            await onComplete(params);

            toast('Machine configuration completed successfully!');
        } catch (err) {
            setLocalError(err?.error?.response?.data?.message || 'Configuration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToPreviousStep = () => {
        setLocalError('');
        setSuccess('');

        if (currentStep === 2) {
            setCurrentStep(1);
        } else if (currentStep === 3) {
            setCurrentStep(2);
            setSelectedTerminal(null);
        }
    };

    const canGoBack = currentStep > 1 && currentStep < 4;

    return (
        <AuthLayout className="max-w-7xl w-full mx-auto">
            <div className="p-6">
                <StepIndicator
                    currentStep={currentStep}
                    totalSteps={3}
                    onBack={canGoBack ? handleBackToPreviousStep : null}
                >
                    {/* Display either parent error or local error */}
                    {displayError && <ErrorAlert message={displayError} />}

                    {currentStep === 1 && (
                        <TenantVerificationStep
                            credentials={registerProps}
                            credentialsValidationSchema={registerValidationSchema}
                            onSubmit={handleVerifyClient}
                        />
                    )}

                    {currentStep === 2 && (
                        <BranchSelectionStep
                            branches={branches}
                            onBranchSelect={handleBranchSelect}
                        />
                    )}

                    {currentStep === 3 && (
                        <TerminalSelectionStep
                            terminals={terminals}
                            selectedTerminal={selectedTerminal}
                            selectedBranch={selectedBranch}
                            onTerminalSelect={handleTerminalSelect}
                            onSubmit={handleSubmitConfiguration}
                            loading={loading}
                        />
                    )}
                </StepIndicator>
            </div>
        </AuthLayout>
    );
};


export default OnboardingFlow;