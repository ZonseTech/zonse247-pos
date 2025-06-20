import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ message }) => (
    <div className="mb-6 px-2 py-4 bg-red-50 border border-red-200 rounded-sm flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{message}</span>
    </div>
);

export default ErrorAlert