import { INIT_CONFIG } from "../constants"
import { useCallback, useState } from "react"
import settingsService from "../services/settings.service"
import { isRetryableError, validateSettingsResponse } from "../utils/retryHelper"

export const useAppInitialization = () => {
    const [state, setState] = useState({
        isAccountVerified: false,
        isLoading: true,
        error: null,
        retryCount: 0,
    })

    const initializeApp = useCallback(async (attemptNumber = 1) => {
        try {
            setState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                retryCount: attemptNumber - 1
            }))

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), INIT_CONFIG.TIMEOUT_DURATION)
            )

            const settings = await Promise.race([
                settingsService.list(),
                timeoutPromise
            ])

            const isVerified = validateSettingsResponse(settings)

            setState(prev => ({
                ...prev,
                isAccountVerified: isVerified,
                isLoading: false,
                error: null,
            }))

            return { success: true, verified: isVerified }

        } catch (error) {
            console.error(`App initialization attempt ${attemptNumber} failed:`, error)

            if (attemptNumber < INIT_CONFIG.MAX_RETRY_ATTEMPTS && isRetryableError(error)) {
                await new Promise(resolve => setTimeout(resolve, INIT_CONFIG.RETRY_DELAY * attemptNumber))
                return initializeApp(attemptNumber + 1)
            }

            setState(prev => ({
                ...prev,
                isAccountVerified: false,
                isLoading: false,
                error: error.message || 'Failed to initialize application',
                retryCount: attemptNumber - 1,
            }))

            return { success: false, error: error.message }
        }
    }, [])

    const retry = useCallback(() => {
        initializeApp()
    }, [initializeApp])

    return { ...state, initializeApp, retry }
}