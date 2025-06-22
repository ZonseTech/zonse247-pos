import { FolderOpen, Plus } from 'lucide-react';
import { FunctionComponent } from 'react';

interface EmptyStateProps {
    searchTerm: string;
    onCreateCategory: () => void;
}

export const EmptyState: FunctionComponent<EmptyStateProps> = ({ searchTerm, onCreateCategory }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FolderOpen className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first category'
            }
        </p>
        {!searchTerm && (
            <button
                onClick={onCreateCategory}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
            >
                <Plus size={20} />
                <span>Create Category</span>
            </button>
        )}
    </div>
);