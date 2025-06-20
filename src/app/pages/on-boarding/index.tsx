import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import ErrorAlert from './partials/ErrorAlert';
import { ROUTES } from '../../utils/constants';
import AuthLayout from '../../layouts/AuthLayout';
import SuccessAlert from './partials/SuccessAlert';
import StepIndicator from './partials/StepIndicator';
import shopsService from '../../services/shop.service';
import clientsService from '../../services/client.service';
import settingsService from '../../services/settings.service';
import ShopSelectionStep from './partials/steps/ShopSelectionStep';
import workstationsService from '../../services/workstation.service';
import ClientVerificationStep from './partials/steps/ClientVerificationStep';
import WorkstationSelectionStep from './partials/steps/WorkstationSelectionStep';
import ConfigurationCompleteStep from './partials/steps/ConfigurationCompleteStep';

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

    const navigate = useNavigate()
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [shops, setShops] = useState<Array<IShop>>([]);
    const [selectedShop, setSelectedShop] = useState<IShop>(null);
    const [verifiedClient, setVerifiedClient] = useState<Client>(null);
    const [workstations, setWorkstations] = useState<Array<Workstation>>([]);
    const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation>(null);

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

    const fetchShops = async (clientId: string) => {
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

    const handleShopSelect = async (shop: IShop) => {
        setSelectedShop(shop);
        setError('');
        setLoading(true);

        try {
            const stationsList = await workstationsService.listByShopCode(shop.shopCode);
            setWorkstations(stationsList);
            setCurrentStep(3);
        } catch (err) {
            setError('Failed to fetch workstations');
        } finally {
            setLoading(false);
        }
    };

    const handleWorkstationSelect = (workstation: Workstation) => {
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
            await settingsService.store({
                clientUuid: verifiedClient.uuid,
                shopUuid: selectedShop.uuid,
                workstationUuid: selectedWorkstation.uuid
            });
            setSuccess('Machine configuration completed successfully!');
            setCurrentStep(4);
        } catch (err) {
            setError('Failed to configure machine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        navigate(ROUTES.LOGIN)
    };

    return (
        <AuthLayout className="max-w-6xl">
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
                    <ShopSelectionStep
                        shops={shops}
                        onShopSelect={handleShopSelect}
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