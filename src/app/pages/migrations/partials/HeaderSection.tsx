import { FunctionComponent } from 'react';
import { HiOutlineDatabase } from 'react-icons/hi';

export const HeaderSection: FunctionComponent<{ showColumnMapping, setShowColumnMapping }> = ({ showColumnMapping, setShowColumnMapping }) => (
    <div>

        <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <HiOutlineDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Database Migration
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Upload and migrate your database files with real-time progress tracking
                    </p>
                </div>
            </div>
        </div>

        <div className="mb-6">
            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setShowColumnMapping(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!showColumnMapping
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Database Migration
                </button>
                <button
                    onClick={() => setShowColumnMapping(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${showColumnMapping
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                >
                    Column Mapping
                </button>
            </div>
        </div>
    </div>
);