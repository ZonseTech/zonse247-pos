import { AlertCircle } from "lucide-react";
import { FunctionComponent } from "react";
import StatusBadge from "../partials/StatusBadge";

const BranchSelectionStep: FunctionComponent<{ branches: Array<Branch>, onBranchSelect }> = ({ branches, onBranchSelect }) => (
    <div className="space-y-6">
        {branches.length > 0 && <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select branch</h2>
            <p className="text-gray-600">Choose the branch associated with this terminal</p>
        </div>}

        <div className="grid gap-4">
            {branches && branches.length > 0 ? (
                branches.map((branch) => (
                    <div
                        key={branch.branchId}
                        onClick={() => onBranchSelect(branch)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{branch.branchName}</h3>
                                <p className="text-gray-600 text-sm">{branch.description || '--'}</p>
                            </div>
                            <StatusBadge status={branch.status} />
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No branches Found</h3>
                    <p className="text-gray-500 mb-4">
                        No branches are available for your account at this time.
                    </p>
                    <p className="text-sm text-gray-400">
                        Please contact your administrator to set up branches for your account.
                    </p>
                </div>
            )}
        </div>
    </div>
);

export default BranchSelectionStep;