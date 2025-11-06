const MobilePlanSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 animate-pulse">
        <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mt-6"></div>
        </div>
    </div>
);

export default MobilePlanSkeleton