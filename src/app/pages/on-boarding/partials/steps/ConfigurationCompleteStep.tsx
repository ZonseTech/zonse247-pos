import { CheckCircle } from "lucide-react";
import { FunctionComponent } from "react";
import { Button } from "../../../../components";

const ConfigurationCompleteStep: FunctionComponent<{
    verifiedTenant: Tenant,
    selectedShop: IShop,
    selectedWorkstation: Workstation,
    onReset
}> = ({
    verifiedTenant,
    selectedShop,
    selectedWorkstation,
    onReset
}) => {

        return (
            <div className="space-y-6 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Complete!</h2>
                    <p className="text-gray-600 mb-4">Your POS machine has been successfully configured</p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="text-left space-y-2 text-gray-900">
                            <p><strong>Client:</strong> {verifiedTenant?.businessName}</p>
                            <p><strong>Shop:</strong> {selectedShop?.name}</p>
                            <p><strong>Workstation:</strong> {selectedWorkstation?.tillName}-{selectedWorkstation.tillNumber}</p>
                            <p><strong>Status:</strong> <span className="text-green-600">Ready for use</span></p>
                        </div>
                    </div>
                </div>

                <Button
                    block
                    onClick={onReset}
                >
                    Configure Another Machine
                </Button>
            </div>
        )
    }


export default ConfigurationCompleteStep