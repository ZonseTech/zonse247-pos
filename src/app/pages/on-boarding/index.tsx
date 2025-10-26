import * as Yup from 'yup';
import { useNavigate } from 'react-router';
import ErrorAlert from './partials/ErrorAlert';
import { ROUTES } from '../../utils/constants';
import AuthLayout from '../../layouts/AuthLayout';
import SuccessAlert from './partials/SuccessAlert';
import { FunctionComponent, useState } from 'react';
import StepIndicator from './partials/StepIndicator';
import branchService from '../../services/branch.service';
import tenantService from '../../services/tenant.service';
import settingsService from '../../services/settings.service';
import terminalService from '../../services/terminal.service';
import BranchSelectionStep from './partials/steps/BranchSelectionStep';
import TerminalSelectionStep from './partials/steps/TerminalSelectionStep';
import ClientVerificationStep from './partials/steps/ClientVerificationStep';
import ConfigurationCompleteStep from './partials/steps/ConfigurationCompleteStep';

const ClientVerification: FunctionComponent = () => {
    const registerProps: TerminalVerificationParams = {
        tenantCode: 'DEFAULT_CLIENT',
        authKey: 'default-auth-key-1761310617487',
        os: '',
        hostname: '',
        macAddress: ''
    }

    const registerValidationSchema: Yup.ObjectSchema<{
        authKey: string;
        tenantCode: string;
    }, Yup.AnyObject, {
        authKey: undefined;
        tenantCode: undefined;
    }, ""> = Yup.object({
        authKey: Yup.string()
            .required('Auth token is required'),

        tenantCode: Yup.string()
            .required('Please enter your tenant code'),
    })

    const navigate = useNavigate()
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [branches, setTenantBranches] = useState<Array<Branch>>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch>(null);
    const [verifiedTenant, setVerifiedTenant] = useState<Tenant>(null);
    const [terminals, setTerminals] = useState<Array<Terminal>>([]);
    const [selectedTerminal, setSelectedTerminal] = useState<Terminal>(null);

    const handleVerifyClient = async (credentials: TerminalVerificationParams) => {
        setError('');

        try {
            const tenant = await tenantService.verify(credentials);
            setVerifiedTenant(tenant);
            setSuccess(`Welcome, ${tenant.businessName}!`);
            setCurrentStep(2);

            await fetchBranchesByTenantId(tenant.tenantId);
        } catch (err) {
            setError((error as any)?.error?.response?.data?.message || 'Verification failed. Please check your credentials.');
        }
    };

    const fetchBranchesByTenantId = async (tenantId: string) => {
        setLoading(true);
        try {
            const response = await branchService.listByTenantId(tenantId);
            setTenantBranches(response.data);
        } catch (err) {
            setError('Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    const handleBranchSelect = async (branch: Branch) => {
        setSelectedBranch(branch);
        setError('');
        setLoading(true);

        try {
            const stationsList = await terminalService.listByBranchId(branch.branchId);
            setTerminals(stationsList);
            setCurrentStep(3);
        } catch (err) {
            setError('Failed to fetch terminals for the selected branch');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminalSelect = (terminal: Terminal) => {
        setSelectedTerminal(terminal);
        setError('');
    };

    const handleSubmitConfiguration = async () => {
        if (!selectedTerminal) {
            setError('Please select a terminal');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const settings = await settingsService.store({
                tenantId: verifiedTenant.tenantId,
                branchId: selectedBranch.branchId,
                terminalId: selectedTerminal.terminalId
            });

            console.log('====================================');
            console.log(settings);
            console.log('====================================');

            setSuccess('Machine configuration completed successfully!');
            setCurrentStep(4);
        } catch (err) {
            setError(err?.error?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        navigate(ROUTES.LOGIN)
    };

    return (
        <AuthLayout className="max-w-7xl">
            <div className="p-6">
                {success && currentStep !== 4 && <SuccessAlert message={success} />}

                <StepIndicator currentStep={currentStep} />

                {error && <ErrorAlert message={error} />}

                {currentStep === 1 && (
                    <ClientVerificationStep
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

                {currentStep === 4 && (
                    <ConfigurationCompleteStep
                        verifiedTenant={verifiedTenant}
                        selectedBranch={selectedBranch}
                        selectedTerminal={selectedTerminal}
                        onReset={resetProcess}
                    />
                )}
            </div>
        </AuthLayout>
    );
};

export default ClientVerification;