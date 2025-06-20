import { FunctionComponent } from "react";
import { Button } from "../../../../components";
import StatusBadge from "../StatusBadge";
import { Monitor, AlertCircle } from "lucide-react";

const WorkstationSelectionStep: FunctionComponent<{
    workstations: Array<Workstation>,
    selectedWorkstation: Workstation,
    selectedShop: IShop,
    onWorkstationSelect,
    onSubmit,
    loading
}> = ({
    workstations,
    selectedWorkstation,
    selectedShop,
    onWorkstationSelect,
    onSubmit,
    loading
}) => (
        <div className="space-y-6">
            {workstations.length > 0 && <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Workstation</h2>
                <p className="text-gray-600">
                    Choose the workstation for <strong>{selectedShop?.name}</strong>
                </p>
            </div>}

            <div className="grid gap-4 max-h-[12rem] overflow-y-auto px-2.5">
                {workstations && workstations.length > 0 ? (
                    workstations.map((workstation) => (
                        <div
                            key={workstation.uuid}
                            onClick={() => onWorkstationSelect(workstation)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedWorkstation.uuid === workstation.uuid
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                } ${workstation.status === 'maintenance' ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <span>{workstation.tillName}-{workstation.tillNumber}</span>
                                        {workstation.isPrimary && (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Primary
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{workstation.deviceType}</p>
                                </div>
                                <StatusBadge status={workstation.status} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Workstations Found</h3>
                        <p className="text-gray-500 mb-4">
                            No workstations are available for <strong>{selectedShop?.name}</strong> at this time.
                        </p>
                        <p className="text-sm text-gray-400">
                            Please contact your administrator to set up workstations for this shop.
                        </p>
                    </div>
                )}
            </div>

            {workstations && workstations.length > 0 && (
                <Button
                    onClick={onSubmit}
                    disabled={!selectedWorkstation}
                    loading={loading}
                    icon={Monitor}
                    block
                    className="bg-purple-700"
                >
                    {loading ? 'Configuring...' : 'Configure Machine'}
                </Button>
            )}
        </div>
    );

export default WorkstationSelectionStep;