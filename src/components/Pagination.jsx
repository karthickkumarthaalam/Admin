import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 gap-4">
      <div className="text-sm text-gray-700">
        Showing {startRecord} to {endRecord} of {totalRecords} results
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Previous
        </button>
        <button
          onClick={() =>
            onPageChange((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
