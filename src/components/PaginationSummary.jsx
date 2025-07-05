export const PaginationSummary = ({
  currentPage,
  pageSize,
  totalRecords,
  currentRecordCount,
}) => {
  const start = (currentPage - 1) * pageSize + (currentRecordCount > 0 ? 1 : 0);
  const end = (currentPage - 1) * pageSize + currentRecordCount;
  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <p className="text-xs sm:text-sm text-gray-600">
      showing {start} to {end} of {totalRecords} ({totalPages}{" "}
      {totalPages === 1 ? "Page" : "Pages"})
    </p>
  );
};
