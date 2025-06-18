import React, { FunctionComponent } from 'react'

const ActivatingStep: FunctionComponent = () => {
    return (
        <div className="text-center space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400">Activating...</h2>
                <p className="text-gray-600 mt-2">
                    Connecting to server and downloading shop settings
                </p>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        Verifying credentials...
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        Registering workstation...
                    </div>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        Downloading settings...
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivatingStep