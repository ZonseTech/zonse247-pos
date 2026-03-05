import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message }) => (
    <div className="mb-6 px-2 py-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-sm flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        <span className="text-red-700 dark:text-red-300">{message}</span>
    </div>
);

export default ErrorAlert