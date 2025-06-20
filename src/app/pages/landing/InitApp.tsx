import { useNavigate } from 'react-router'
import { INIT_CONFIG } from '../../constants'
import { ROUTES } from '../../utils/constants'
import { useEffect, FunctionComponent } from 'react'
import PageLoader from '../../components/PageLoader'
import InitializationError from './partials/InitializationError'
import { useAppInitialization } from '../../hooks/useAppInitialization'

const InitApp: FunctionComponent = () => {
    const navigate = useNavigate()
    const {
        isAccountVerified,
        isLoading,
        error,
        retryCount,
        initializeApp,
        retry
    } = useAppInitialization()

    useEffect(() => {
        initializeApp()
    }, [initializeApp])

    useEffect(() => {
        if (!isLoading && !error) {
            if (isAccountVerified) navigate(ROUTES.LOGIN)
            else navigate(ROUTES.LANDING_PAGE)
        }
    }, [isLoading, error, isAccountVerified])

    if (error) {
        return (
            <InitializationError
                error={error}
                onRetry={retry}
                retryCount={retryCount}
            />
        )
    }

    return (
        <div className="relative">
            <PageLoader />
            {retryCount > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white shadow-lg rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">
                            Retrying... ({retryCount}/{INIT_CONFIG.MAX_RETRY_ATTEMPTS})
                        </p>
                    </div>
                </div>
            )}
            {!isLoading && !error && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                        <p className="text-sm text-green-700">
                            Initialization complete. Redirecting...
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InitApp