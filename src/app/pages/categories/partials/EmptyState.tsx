import { FolderOpen, Plus, Search, Sparkles } from 'lucide-react';
import { FunctionComponent } from 'react';

interface EmptyStateProps {
    searchTerm: string;
    onCreateCategory: () => void;
}

export const EmptyState: FunctionComponent<EmptyStateProps> = ({ searchTerm, onCreateCategory }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
        <div className="relative inline-flex mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                {searchTerm ? (
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 dark:text-blue-400" />
                ) : (
                    <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 dark:text-blue-400" />
                )}
            </div>
            {!searchTerm && (
                <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
            )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
            {searchTerm
                ? 'Try adjusting your search terms or clear the filter to see all categories'
                : 'Categories help you organize your products. Create your first category to get started!'
            }
        </p>
        {!searchTerm && (
            <button
                onClick={onCreateCategory}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-medium">Create Category</span>
            </button>
        )}
    </div>
);