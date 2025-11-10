import React, { FunctionComponent, useState } from 'react';
import { Button } from '../../../components';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import MetadataService from '../../../services/metadata.service';

interface SetupTerminalProps {
    params: ValidationParams;
    loading?: boolean;
    onComplete: () => void;
}

const SetupTerminal: FunctionComponent<SetupTerminalProps> = ({ onComplete, params }) => {
    const [metadata, setMetadata] = useState<Array<MetadataItem>>([
        { key: 'roles', label: 'Roles', loaded: false, loading: false, error: null },
        { key: 'permissions', label: 'Permissions', loaded: false, loading: false, error: null },
        { key: 'role-permissions', label: 'Role permissions', loaded: false, loading: false, error: null },
        { key: 'subscription-plans', label: 'Subscription slans', loaded: false, loading: false, error: null },
        { key: 'tenant-subscription', label: 'Tenant subscription', loaded: false, loading: false, error: null },
        { key: 'default-user', label: 'Users', loaded: false, loading: false, error: null },
        { key: 'customer', label: 'Customer', loaded: false, loading: false, error: null },
        { key: 'category', label: 'Category', loaded: false, loading: false, error: null },
        { key: 'payment-methods', label: 'payment methods', loaded: false, loading: false, error: null },
        { key: 'payment-service-provider', label: 'Payment service provider', loaded: false, loading: false, error: null },
    ]);

    const [loadingAll, setLoadingAll] = useState(false);

    const handleLoadSingle = async (key: MetadataType) => {
        const item = metadata.find(m => m.key === key);
        if (item?.loaded || item?.loading || loadingAll) {
            return;
        }

        setMetadata(prev => prev.map(item =>
            item.key === key ? { ...item, loading: true, error: null } : item
        ));

        try {
            await MetadataService.loadMetadata(key, params);
            setMetadata(prev => prev.map(item =>
                item.key === key ? { ...item, loading: false, loaded: true } : item
            ));
        } catch (error) {
            setMetadata(prev => prev.map(item =>
                item.key === key
                    ? { ...item, loading: false, error: error instanceof Error ? error.message : 'Failed to load' }
                    : item
            ));
        }
    };

    const handleLoadAll = async () => {
        setLoadingAll(true);

        setMetadata(prev => prev.map(item => ({
            ...item,
            loading: true,
            error: null,
            loaded: false
        })));

        for (const item of metadata) {
            try {
                await MetadataService.loadMetadata(item.key, params);
                setMetadata(prev => prev.map(m =>
                    m.key === item.key ? { ...m, loading: false, loaded: true } : m
                ));
            } catch (error) {
                setMetadata(prev => prev.map(m =>
                    m.key === item.key
                        ? { ...m, loading: false, error: error instanceof Error ? error.message : 'Failed to load' }
                        : m
                ));
            }
        }

        setLoadingAll(false);
    };

    const allLoaded = metadata.every(item => item.loaded);
    const anyLoading = metadata.some(item => item.loading) || loadingAll;

    return (
        <div className="space-y-6 mb-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Terminal</h2>
                <p className="text-gray-600">
                    Load metadata to complete terminal configuration
                </p>
            </div>

            <div className="rounded-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
                    <Button
                        onClick={handleLoadAll}
                        disabled={anyLoading || allLoaded}
                        loading={loadingAll}
                        theme="primary"
                    >
                        Load All
                    </Button>
                </div>

                <div className="space-y-3">
                    {metadata.map((item) => (
                        <div
                            key={item.key}
                            onClick={() => handleLoadSingle(item.key)}
                            className={`flex items-center justify-between transition-colors ${item.loaded || item.loading || loadingAll
                                ? 'cursor-not-allowed opacity-60'
                                : 'cursor-pointer hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                {item.loaded ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : item.loading ? (
                                    <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                                ) : item.error ? (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{item.label}</p>
                                    {item.error && (
                                        <p className="text-xs text-red-500 mt-1">{item.error}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {item.loaded ? 'Loaded' : item.loading ? 'Loading...' : 'Click to load'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={onComplete}
                    disabled={!allLoaded || anyLoading}
                    theme="success"
                    size="large"
                    block
                >
                    Done
                </Button>
            </div>
        </div>
    );
};

export default SetupTerminal;