import React, { type PropsWithChildren } from 'react'
import { Logo, ImageLight } from '../assets/images'
import { version } from '../../../package.json'

const AuthLayout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex bg-gray-50 bg-radial-green items-center min-h-screen p-6">
            <div className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl ">
                <div className="flex flex-col overflow-y-auto md:flex-row">
                    <main className="flex items-center justify-center p-12 sm:p-12 md:w-1/2">
                        <div className="w-full">
                            <a href="" className="text-2xl border rounded-md border-gray-200 font-semibold flex justify-center items-center mb-8 lg:mb-10">
                                <img src={Logo} className="h-28 mr-4" alt="App Logo" />
                            </a>
                            {children}
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Version {version || '1.0.0'}
                            </p>
                        </div>
                    </main>
                    <div className="h-20 md:h-auto md:w-1/2">
                        <img
                            aria-hidden="true"
                            className="object-cover w-full h-full"
                            src={ImageLight}
                            alt="Office"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout