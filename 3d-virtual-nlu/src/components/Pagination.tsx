import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { DOTS, usePagination } from "../hooks/usePagination";
import styles from "../styles/pagination.module.css";

type PaginationProps = {
  onPageChange: (currentPage: number) => void; //call back
  totalCount: number;
  siblingCount: number;
  currentPage: number;
  pageSize: number;
  classNameOption?: string;
};

const Pagination: React.FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount,
  currentPage,
  pageSize,
  classNameOption,
}) => {
  const paginationRange = usePagination({
    totalCount,
    siblingCount,
    currentPage,
    pageSize,
  });

  if (currentPage === 0 || paginationRange?.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange?.length - 1];

  return (
    <ul className={`${styles.pagination_container} `}>
      {currentPage !== 1 && (
        <li className={styles.pagination_item} onClick={onPrevious}>
          <MdKeyboardArrowLeft />
        </li>
      )}
      {paginationRange.map((pageNumber, idx) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li
              key={`dots-${idx}`}
              className={`${styles.pagination_item} ${styles.dots}`}
            >
              &#8230;
            </li>
          );
        }

        return (
          <li
            key={`pages-${pageNumber}`}
            className={`${styles.pagination_item} 
            ${pageNumber === currentPage ? styles.current_item : ""}
            `}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}
      {currentPage !== lastPage && (
        <li className={styles.pagination_item} onClick={onNext}>
          {" "}
          <MdKeyboardArrowRight />
        </li>
      )}
    </ul>
  );
};

export default Pagination;
