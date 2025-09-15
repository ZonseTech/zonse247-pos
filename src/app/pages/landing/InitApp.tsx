import { useNavigate } from 'react-router'
import { INIT_CONFIG } from '../../constants'
import { ROUTES } from '../../utils/constants'
import { useEffect, useState, useCallback, useRef, FunctionComponent } from 'react'
import PageLoader from '../../components/PageLoader'
import InitializationError from './partials/InitializationError'
import settingsService from '../../services/settings.service'
import {
    isRetryableError,
    validateSettingsResponse,
} from '../../utils/retryHelper'

interface InitializationState {
    isAccountVerified: boolean
    isLoading: boolean
    error: string | null
    retryCount: number
}

interface InitializationResult {
    success: boolean
    verified?: boolean
    error?: string
}

const InitApp: FunctionComponent = () => {
    const navigate = useNavigate()
    const isMountedRef = useRef(true)

    const [initialization, setInitialization] = useState<InitializationState>({
        isAccountVerified: false,
        isLoading: true,
        error: null,
        retryCount: 0,
    })

    const initializeApp = useCallback(
        async (attemptNumber = 1): Promise<InitializationResult> => {
            try {
                if (!isMountedRef.current) {
                    return { success: false, error: 'Component unmounted' }
                }

                setInitialization((prev) => ({
                    ...prev,
                    isLoading: true,
                    error: null,
                    retryCount: attemptNumber - 1,
                }))

                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Request timeout')),
                        INIT_CONFIG.TIMEOUT_DURATION
                    )
                )

                const settingsPromise = settingsService.load()
                const setupPromise = settingsService.setup()

                const [settings, setup] = await Promise.race([
                    Promise.all([settingsPromise, setupPromise]),
                    timeoutPromise
                ])

                const isVerified = validateSettingsResponse(settings)

                setInitialization((prev) => ({
                    ...prev,
                    isAccountVerified: setup?.isCompleted || false,
                    isLoading: false,
                    error: null,
                }))

                return { success: true, verified: isVerified }
            } catch (error) {
                console.error(
                    `App initialization attempt ${attemptNumber} failed:`,
                    error
                )

                if (
                    attemptNumber < INIT_CONFIG.MAX_RETRY_ATTEMPTS &&
                    isRetryableError(error)
                ) {
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            INIT_CONFIG.RETRY_DELAY * Math.pow(2, attemptNumber - 1)
                        )
                    )

                    return initializeApp(attemptNumber + 1)
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to initialize application'

                setInitialization((prev) => ({
                    ...prev,
                    isAccountVerified: false,
                    isLoading: false,
                    error: errorMessage,
                    retryCount: attemptNumber - 1,
                }))

                return { success: false, error: errorMessage }
            }
        },
        []
    )

    const retry = useCallback(() => {
        initializeApp()
    }, [initializeApp])

    useEffect(() => {
        initializeApp()
    }, [initializeApp])

    useEffect(() => {
        if (!initialization.isLoading && !initialization.error) {
            if (initialization.isAccountVerified) {
                navigate(ROUTES.LOGIN)
            } else {
                navigate(ROUTES.LANDING_PAGE)
            }
        }
    }, [initialization.isLoading, initialization.error, initialization.isAccountVerified, navigate])

    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])

    if (initialization.error) {
        return (
            <InitializationError
                error={initialization.error}
                onRetry={retry}
                retryCount={initialization.retryCount}
            />
        )
    }

    return (
        <div className="relative">
            <PageLoader />
            {initialization.retryCount > 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white shadow-lg rounded-lg px-4 py-2">
                        <p className="text-sm text-gray-600">
                            Retrying... ({initialization.retryCount}/{INIT_CONFIG.MAX_RETRY_ATTEMPTS})
                        </p>
                    </div>
                </div>
            )}
            {!initialization.isLoading && !initialization.error && (
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