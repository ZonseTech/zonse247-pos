import { useState } from 'react';
import WorkstationSelectionStep from './partials/steps/WorkstationSelectionStep';
import ShopSelectionStep from './partials/steps/ShopSelectionStep';
import ConfigurationCompleteStep from './partials/steps/ConfigurationCompleteStep';
import ClientVerificationStep from './partials/steps/ClientVerificationStep';
import ErrorAlert from './partials/ErrorAlert';
import SuccessAlert from './partials/SuccessAlert';
import StepIndicator from './partials/StepIndicator';
import clientsService from '../../services/client.service';
import shopsService from '../../services/shop.service';
import * as Yup from 'yup';
import AuthLayout from '../../layouts/AuthLayout';

const workstationsService = {
    async list(query) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return [
            { id: 'ws-1', name: 'Register 1', type: 'POS', status: 'active', is_primary: true },
            { id: 'ws-2', name: 'Register 2', type: 'POS', status: 'active', is_primary: false },
            { id: 'ws-3', name: 'Back Office', type: 'Admin', status: 'active', is_primary: false },
            { id: 'ws-4', name: 'Mobile Terminal', type: 'Mobile', status: 'maintenance', is_primary: false }
        ];
    },

    async setPrimary(id) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { id, status: 'success' };
    }
};

const ClientVerification = () => {
    const registerProps: ShopVerificationParams = {
        clientId: '',
        authKey: '',
        os: '',
        hostname: '',
        macAddress: ''
    }

    const registerValidationSchema: Yup.ObjectSchema<{
        authKey: string;
        clientId: string;
    }, Yup.AnyObject, {
        authKey: undefined;
        clientId: undefined;
    }, ""> = Yup.object({
        authKey: Yup.string()
            .required('Auth token is required'),

        clientId: Yup.string()
            .required('Please enter your clientId'),
    })

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verifiedClient, setVerifiedClient] = useState(null);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [workstations, setWorkstations] = useState([]);
    const [selectedWorkstation, setSelectedWorkstation] = useState(null);

    const handleVerifyClient = async (credentials: ShopVerificationParams) => {
        setError('');

        try {
            const client = await clientsService.verify(credentials);
            setVerifiedClient(client);
            setSuccess(`Welcome, ${client.companyName}!`);
            setCurrentStep(2);

            await fetchShops(client.clientId);
        } catch (err) {
            setError((error as any)?.error?.response?.data?.message || 'Verification failed. Please check your credentials.');
        }
    };

    const fetchShops = async (clientId) => {
        setLoading(true);
        try {
            const response = await shopsService.listByClient(clientId);
            setShops(response.data);
        } catch (err) {
            setError('Failed to fetch shops');
        } finally {
            setLoading(false);
        }
    };

    const handleShopSelect = async (shop) => {
        setSelectedShop(shop);
        setError('');
        setLoading(true);

        try {
            const stationsList = await workstationsService.list({ shopId: shop.id });
            setWorkstations(stationsList);
            setCurrentStep(3);
        } catch (err) {
            setError('Failed to fetch workstations');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkstationSelect = (workstation) => {
        setSelectedWorkstation(workstation);
        setError('');
    };

    const handleSubmitConfiguration = async () => {
        if (!selectedWorkstation) {
            setError('Please select a workstation');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await workstationsService.setPrimary(selectedWorkstation.id);
            setSuccess('Machine configuration completed successfully!');
            setCurrentStep(4);
        } catch (err) {
            setError('Failed to configure machine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        setCurrentStep(1);
        registerProps.clientId = ''
        registerProps.authKey = ''
        setVerifiedClient(null);
        setShops([]);
        setSelectedShop(null);
        setWorkstations([]);
        setSelectedWorkstation(null);
        setError('');
        setSuccess('');
    };

    return (
        <AuthLayout className="max-w-6xl">
            <div className="p-6">
                <StepIndicator currentStep={currentStep} />

                {error && <ErrorAlert message={error} />}
                {success && currentStep !== 4 && <SuccessAlert message={success} />}

                {currentStep === 1 && (
                    <ClientVerificationStep
                        credentials={registerProps}
                        credentialsValidationSchema={registerValidationSchema}
                        onSubmit={handleVerifyClient}
                    />
                )}

                {currentStep === 2 && (
                    <ShopSelectionStep
                        shops={shops}
                        onShopSelect={handleShopSelect}
                        loading={loading}
                    />
                )}

                {currentStep === 3 && (
                    <WorkstationSelectionStep
                        workstations={workstations}
                        selectedWorkstation={selectedWorkstation}
                        selectedShop={selectedShop}
                        onWorkstationSelect={handleWorkstationSelect}
                        onSubmit={handleSubmitConfiguration}
                        loading={loading}
                    />
                )}

                {currentStep === 4 && (
                    <ConfigurationCompleteStep
                        verifiedClient={verifiedClient}
                        selectedShop={selectedShop}
                        selectedWorkstation={selectedWorkstation}
                        onReset={resetProcess}
                    />
                )}
            </div>
        </AuthLayout>
    );
};

export default ClientVerification;