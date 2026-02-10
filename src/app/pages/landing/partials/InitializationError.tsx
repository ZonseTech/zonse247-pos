import { FunctionComponent } from "react"
import { INIT_CONFIG } from "../../../constants"

const InitializationError: FunctionComponent<{ error, onRetry, retryCount }> = ({ error, onRetry, retryCount }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
                Initialization Failed
            </h3>
            <p className="text-red-700 mb-4">
                {error}
            </p>
            {retryCount > 0 && (
                <p className="text-sm text-red-500 mb-4">
                    Retry attempts: {retryCount}/{INIT_CONFIG.MAX_RETRY_ATTEMPTS}
                </p>
            )}
            <button
                onClick={onRetry}
                className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
)

export default InitializationError