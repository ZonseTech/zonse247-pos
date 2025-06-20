import { CheckCircle } from "lucide-react";

const SuccessAlert = ({ message }) => (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-700">{message}</span>
    </div>
);

export default SuccessAlert