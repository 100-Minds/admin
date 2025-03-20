import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationProps = {
  currentPage: number;
  totalPageCount: number;
  onPageChange: (value: number) => void;
};

function PaginationComponent({
  currentPage,
  totalPageCount,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPageCount <= maxVisiblePages) {
      for (let i = 1; i <= totalPageCount; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPageCount);
      } else if (currentPage >= totalPageCount - 2) {
        pages.push(
          1,
          "...",
          totalPageCount - 3,
          totalPageCount - 2,
          totalPageCount - 1,
          totalPageCount
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPageCount
        );
      }
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent className="flex items-center gap-4">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={() =>
              onPageChange(Math.min(totalPageCount, currentPage + 1))
            }
            aria-disabled={currentPage === totalPageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
export default PaginationComponent;
