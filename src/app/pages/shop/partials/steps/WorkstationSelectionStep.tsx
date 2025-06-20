import { Button } from "../../../../components";
import StatusBadge from "../StatusBadge";
import { Monitor } from "lucide-react";

const WorkstationSelectionStep = ({
    workstations,
    selectedWorkstation,
    selectedShop,
    onWorkstationSelect,
    onSubmit,
    loading
}) => (
    <div className="space-y-6">
        <div className="text-center">
            <Monitor className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Workstation</h2>
            <p className="text-gray-600">
                Choose the workstation for <strong>{selectedShop?.name}</strong>
            </p>
        </div>

        <div className="grid gap-4">
            {workstations.map((workstation) => (
                <div
                    key={workstation.id}
                    onClick={() => onWorkstationSelect(workstation)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedWorkstation?.id === workstation.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        } ${workstation.status === 'maintenance' ? 'opacity-50' : ''}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{workstation.name}</span>
                                {workstation.is_primary && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                        Primary
                                    </span>
                                )}
                            </h3>
                            <p className="text-gray-600 text-sm">{workstation.type}</p>
                        </div>
                        <StatusBadge status={workstation.status} />
                    </div>
                </div>
            ))}
        </div>

        <Button
            onClick={onSubmit}
            disabled={!selectedWorkstation}
            loading={loading}
            icon={Monitor}
            className="bg-purple-700"
        >
            {loading ? 'Configuring...' : 'Configure Machine'}
        </Button>
    </div>
);

export default WorkstationSelectionStep