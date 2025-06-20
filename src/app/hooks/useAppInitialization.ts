import { INIT_CONFIG } from "../constants"
import { useCallback, useState } from "react"
import settingsService from "../services/settings.service"
import { isRetryableError, validateSettingsResponse } from "../utils/retryHelper"

export const useAppInitialization = () => {
    const [state, setState] = useState<InitializationState>({
        isAccountVerified: false,
        isLoading: true,
        error: null,
        retryCount: 0,
    })

    const initializeApp = useCallback(async (attemptNumber = 1): Promise<InitializationResult> => {
        try {
            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                retryCount: attemptNumber - 1
            }))

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), INIT_CONFIG.TIMEOUT_DURATION)
            )

            const settingsPromise = settingsService.load()
            const setupPromise = settingsService.setup()

            const [settings, setup] = await Promise.race([
                Promise.all([settingsPromise, setupPromise]),
                timeoutPromise
            ])

            const isVerified = validateSettingsResponse(settings)

            setState(prev => ({
                ...prev,
                isAccountVerified: setup?.isCompleted || false,
                isLoading: false,
                error: null,
            }))

            return { success: true, verified: isVerified }

        } catch (error) {
            console.error(`App initialization attempt ${attemptNumber} failed:`, error)

            if (attemptNumber < INIT_CONFIG.MAX_RETRY_ATTEMPTS && isRetryableError(error)) {
                await new Promise(resolve =>
                    setTimeout(resolve, INIT_CONFIG.RETRY_DELAY * Math.pow(2, attemptNumber - 1))
                )
                return initializeApp(attemptNumber + 1)
            }

            const errorMessage = error instanceof Error ? error.message : 'Failed to initialize application'

            setState(prev => ({
                ...prev,
                isAccountVerified: false,
                isLoading: false,
                error: errorMessage,
                retryCount: attemptNumber - 1,
            }))

            return { success: false, error: errorMessage }
        }
    }, [])

    const retry = useCallback(() => {
        initializeApp()
    }, [initializeApp])

    return {
        ...state,
        initializeApp,
        retry
    }
}