import { FunctionComponent } from 'react';
import { Check, Download, RefreshCw } from 'lucide-react';
import { getItemDisplayName, getItemId } from './step-list.utils';

/**
 * Data preview list props
 */
export interface DataPreviewListProps {
    step: OnboardingStep;
    data: any[];
    selectedIds: Set<string>;
    onToggleItem: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onRefetch: () => void;
    isFetching: boolean;
}

/**
 * Data preview list with checkboxes for selective sync
 */
const DataPreviewList: FunctionComponent<DataPreviewListProps> = ({
    step,
    data,
    selectedIds,
    onToggleItem,
    onSelectAll,
    onDeselectAll,
    onRefetch,
    isFetching,
}) => {
    const allSelected = data.length > 0 && selectedIds.size === data.length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <button
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedIds.size} of {data.length} selected
                    </span>
                </div>
                <button
                    onClick={onRefetch}
                    disabled={isFetching}
                    className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="max-h-[450px] overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Download className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data found</p>
                    </div>
                ) : (
                    data.map((item) => {
                        const itemId = getItemId(item, step.stepType);
                        const isSelected = selectedIds.has(itemId);
                        return (
                            <label
                                key={itemId}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                    ? 'bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700'
                                    : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleItem(itemId)}
                                    className="w-4 h-4 text-sky-600 rounded border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 focus:ring-sky-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {getItemDisplayName(item, step.stepType)}
                                    </p>
                                    {item.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                                )}
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DataPreviewList;
