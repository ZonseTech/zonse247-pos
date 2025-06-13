import { AlertCircle } from 'lucide-react'
import type { FunctionComponent } from 'react'

const ErrorStep: FunctionComponent<{ errorMessage, setStep }> = ({ errorMessage, setStep }) => {
    return (
        <div className="text-center space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Activation Failed</h2>
                <p className="text-gray-600 mt-2">
                    There was an error activating your workstation.
                </p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{errorMessage}</p>
            </div>
            <div className="space-y-3">
                <button
                    onClick={() => setStep('input')}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Try Again
                </button>
                <p className="text-sm text-gray-500">
                    If the problem persists, contact your administrator
                </p>
            </div>
        </div>
    )
}

export default ErrorStep