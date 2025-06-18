import { useNavigate } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { ROUTES } from '../../../utils/constants'
import type { FunctionComponent } from 'react'

const SuccessStep: FunctionComponent = () => {
    const navigate = useNavigate()

    return (
        <div className="text-center space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activation Complete!</h2>
                <p className="text-gray-600 mt-2">
                    Your workstation has been successfully activated and is ready to use.
                </p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                    <li>• Shop settings have been downloaded</li>
                    <li>• Workstation is registered in the system</li>
                    <li>• You can now create local users</li>
                    <li>• Data will sync when online</li>
                </ul>
            </div>
            <button
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="px-6 py-3 border border-green-500 text-green-500 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
                Continue to Dashboard
            </button>
        </div>
    )
}

export default SuccessStep