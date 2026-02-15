import { FunctionComponent } from "react";
import MobilePageHeader from "../page/MobilePageHeader";

const MobilePlanSkeleton: FunctionComponent = () => (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
        <div className="fixed top-0 left-0 right-0 z-50">
            <MobilePageHeader
                title="Loading..."
                className="bg-white dark:bg-gray-800"
            />
        </div>
        <div className="flex-1 pt-[60px] px-4 py-4">
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

export default MobilePlanSkeleton