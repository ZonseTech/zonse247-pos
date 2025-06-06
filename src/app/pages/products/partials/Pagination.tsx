interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded ${currentPage === 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Previous
                </button>

                <button
                    className="px-4 py-2 border rounded bg-cyan-400 text-white"
                >
                    {currentPage}
                </button>
                <button
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;  