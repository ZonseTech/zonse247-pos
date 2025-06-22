import { Plus } from 'lucide-react';
import { FunctionComponent } from 'react';

interface PageHeaderProps {
    onCreateCategory: () => void;
}

export const PageHeader: FunctionComponent<PageHeaderProps> = ({ onCreateCategory }) => (
    <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product categories</p>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={onCreateCategory}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-sm"
                >
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </div>
        </div>
    </div>
);