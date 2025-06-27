import { FunctionComponent, RefObject } from 'react';
import { formatFileSize } from '../../../utils';
import { HiOutlineUpload } from 'react-icons/hi';
import { HiOutlineFolder } from 'react-icons/hi2';

type Props = {
    selectedFile: File | null,
    onDrop: (event: React.DragEvent) => void,
    onDragOver: (event: React.DragEvent) => void,
    fileInputRef: RefObject<HTMLInputElement | null>
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropzone: FunctionComponent<Props> = ({
    selectedFile,
    onDrop,
    onDragOver,
    onFileSelect,
    fileInputRef
}) => (
    <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${selectedFile
            ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
    >
        <input
            ref={fileInputRef}
            type="file"
            accept=".db,.json,.csv"
            onChange={onFileSelect}
            className="hidden"
        />

        {selectedFile ? (
            <div className="space-y-4">
                <div className="flex justify-center">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                        <HiOutlineFolder className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <div>
                    <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                        {selectedFile.name}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatFileSize(selectedFile.size)}
                    </p>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    Ready for upload
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex justify-center">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <HiOutlineUpload className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
                <div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Drop your database file here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        or click to browse your files
                    </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>Supports:</span>
                    <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.db</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.json</span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">.csv</span>
                    </div>
                </div>
            </div>
        )}
    </div>
);