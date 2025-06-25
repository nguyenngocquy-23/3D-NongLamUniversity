import { useMemo } from "react";
export const DOTS = "..." as const;

/**
 * totalCount: Số lượng item của danh sách.
 * pageSize: Số lượng item trên 1 danh sách.
 * siblingCount: Là số lượng item hiển thị 2 bên của currentPage. Ví dụ: sibling : 1 => ...5 [6] 7 ..
 * currentPage: Item hiển thị hiện tại.
 */
type usePaginationProps = {
  totalCount: number;
  pageSize: number;
  siblingCount: number;
  currentPage: number;
};

type PaginationItem = number | typeof DOTS;
export const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: usePaginationProps): PaginationItem[] => {
  const paginationRange = useMemo(() => {
    //[first page] [DOTS...] [Sibling Left ] [CurrentPage] [Sibling Right] [DOTS...] [last page]
    const totalPageCount = Math.ceil(totalCount / pageSize);

    const range = (start: number, end: number) => {
      let length = end - start + 1;

      return Array.from({ length }, (_, idx) => idx + start);
    };
    // Tổng số item hiển thị mà không cần ...: first page (1) + sibling left (1) + currentPage (1) + sibling right(1) + lastPage => Số lượng ít nhất.
    const totalPageNumbers = siblingCount + 5;

    /**
     * Case 1 : Số lượng trang trong thực tế (totalPageCount) ít hơn số trang mà thanh phân trang muốn hiển thị
     */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }
    /**
     * Cần tính toán lại trái phải của trang hiện tại đảm bảo nó nằm trong khoảng 1 -> totalPageCount
     */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPageCount
    );
    /**
     * Chúng ta sẽ chỉ không show ... khi
     */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;
    /**
     *  2 * 1 + 3 = 5
     *Range : 1 --> 5
     */

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(
        totalPageCount - rightItemCount + 1,
        totalPageCount
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalCount, pageSize, siblingCount, currentPage]);
  return paginationRange;
};
