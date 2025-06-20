import { CheckCircle } from "lucide-react";
import { FunctionComponent } from "react";
import { Button } from "../../../../components";

const ConfigurationCompleteStep: FunctionComponent<{
    verifiedClient: Client,
    selectedShop: IShop,
    selectedWorkstation: Workstation,
    onReset
}> = ({
    verifiedClient,
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
                        <div className="text-left space-y-2">
                            <p><strong>Client:</strong> {verifiedClient?.companyName}</p>
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