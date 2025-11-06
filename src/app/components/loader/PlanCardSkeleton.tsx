const PlanCardSkeleton = () => (
    <div className="p-8 border-r border-gray-200 animate-pulse">
        <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
        </div>
    </div>
);

export default PlanCardSkeleton