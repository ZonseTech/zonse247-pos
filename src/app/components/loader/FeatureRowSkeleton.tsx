const FeatureRowSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-gray-100 animate-pulse">
        <div className="p-4 border-r border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-r border-gray-200 flex justify-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            </div>
        ))}
    </div>
);

export default FeatureRowSkeleton