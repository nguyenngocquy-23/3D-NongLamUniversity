import { Link, useNavigate } from "react-router-dom";
import { FaUpload, FaPlus, FaMicrophone } from "react-icons/fa6";
import styles from "../../styles/managerTour.module.css";
import { IoSearch } from "react-icons/io5";
import { TiFilter } from "react-icons/ti";
import { FaSortAmountDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { useMemo, useState } from "react";
import { NodeItem } from "../../components/admin/NodeItem";
import {
  HotspotInformation,
  HotspotMedia,
  HotspotModel,
  HotspotNavigation,
} from "../../redux/slices/HotspotSlice";

export interface NodeObject {
  id: number;
  spaceId: number;
  fieldId: number;
  userId: number;
  url: string;
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  yawOffset: number;
  status: number;
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  updatedAt: number;
  navHotspots: HotspotNavigation[];
  infoHotspots: HotspotInformation[];
  mediaHotspots: HotspotMedia[];
  modelHotspots: HotspotModel[];
}

const ManagerTour = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const nodes = useSelector((state: RootState) => state.data.nodes);

  //Custom phân trang client-side.
  const [currentPage, setCurrentPage] = useState<number>(1);
  let pageSize = 10; // Số lượng bản ghi trên 1 page.

  const currentListNodeData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return nodes.slice(firstPageIndex, lastPageIndex);
  }, [currentPage]);

  // Chon space
  const handleSelectNode = (node: any) => {
    navigate("/admin/updateTour", { state: node });
  };

  return (
    <div className={styles.container}>
      <div className={styles.tour_features}>
        <div className={`${styles.tour_search_box} ${styles.tour_box}`}>
          <input
            type="text"
            name="field"
            id="input"
            placeholder="Tìm kiếm tour mới..."
            className={styles.tour_search_input}
          />
          <label htmlFor="input" className={styles.label_for_search}>
            <IoSearch className={styles.search_icon} />
          </label>
          <div className={styles.border}></div>
          <button className={styles.mic_search}>
            <FaMicrophone className={styles.mic_icon} />
          </button>
        </div>

        <div className={`${styles.tour_filter_box} ${styles.tour_box}`}>
          <TiFilter className={styles.filter_icon} />
          <button className={styles.filter_popup}>Lọc</button>
        </div>

        <div className={`${styles.tour_sort_box} ${styles.tour_box}`}>
          <FaSortAmountDown className={styles.sort_icon} />
          <button className={styles.filter_popup}>Tên</button>
        </div>

        <Link
          to="/admin/createTour"
          className={`${styles.tour_add} ${styles.tour_box}`}
        >
          Thêm tour mới
        </Link>
      </div>
      <hr className={styles.break} />

      <div className={styles.tour_quantity}>Kết quả: {nodes.length} tour.</div>

      <div className={styles.tour_list}>
        {currentListNodeData.map((node) => (
          <NodeItem
            key={node.id}
            node={node}
            onclick={() => handleSelectNode(node)}
          />
        ))}
      </div>

      {/* <div className={styles.field_pagination}>
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          totalCount={fields.length}
          siblingCount={1}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div> */}
    </div>
  );
};

export default ManagerTour;
