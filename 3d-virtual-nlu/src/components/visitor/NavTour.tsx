import { useEffect, useState } from "react";
import {
  FaAddressBook,
  FaAngleLeft,
  FaCaretDown,
  FaCaretUp,
} from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/navTour.module.css";
import { useDispatch } from "react-redux";
import { clearPanorama } from "../../redux/slices/PanoramaSlice";
import { resetStep } from "../../redux/slices/StepSlice";
import { RxAvatar } from "react-icons/rx";
import { GrGallery } from "react-icons/gr";
import { IoIosAddCircle } from "react-icons/io";

type NavTourProps = {
  setIsOpenNav: (val: any) => void;
};

const NavTour = ({ setIsOpenNav }: NavTourProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setIsOpenNav((prev: boolean) => !prev);
  };
  const userJson = sessionStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const [isNav, setIsNav] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname === "/manage") {
      setIsNav(1);
    } else if (location.pathname === "/manage/tours") {
      setIsNav(2);
    } else if (location.pathname === "/manage/createTour") {
      dispatch(clearPanorama());
      dispatch(resetStep());
      setIsNav(3);
    } else if (location.pathname === "/manage/profile") {
      setIsNav(4);
    } else if (location.pathname.toString().includes("/manage/tour")) {
      setIsNav(2);
    }
  }, [location.pathname]);

  return (
    <nav
      className={styles.container}
      style={{
        height: isOpen ? "max-content" : undefined,
      }}
    >
      {isOpen ? (
        <span
          className={styles.back_btn}
          onClick={() => {
            navigate("/");
          }}
        >
          <FaAngleLeft />
        </span>
      ) : (
        ""
      )}
      <span className={styles.toggle} onClick={handleToggle} style={{bottom: isOpen ? "-10px" : "-20px"}}>
        {isOpen ? <FaCaretUp /> : <FaCaretDown className={styles.toggle_open} />}
      </span>

      {isOpen && (
        <ul className={styles.nav_list}>
          <Link
            to={"/manage/"}
            onClick={() => setIsNav(1)}
            className={isNav === 1 ? styles.nav_active : ""}
          >
            <li className={`${styles.title} ${isNav == 1 ? styles.show : ""}`}>
              <span className={styles.title_label}>
                <FaAddressBook />
                Hồ sơ
              </span>
            </li>
          </Link>
          <Link
            to={"/manage/tours"}
            className={isNav === 2 ? styles.nav_active : ""}
            onClick={() => setIsNav(2)}
          >
            <li className={`${styles.title} ${isNav == 2 ? styles.show : ""}`}>
              <span className={styles.title_label}>
                <GrGallery /> Tour của bạn
              </span>
            </li>
          </Link>
          <Link
            to={"/manage/createTour"}
            onClick={() => setIsNav(3)}
            className={isNav === 3 ? styles.nav_active : ""}
          >
            <li className={`${styles.title} ${isNav == 3 ? styles.show : ""}`}>
              <span className={styles.title_label}>
                {" "}
                <IoIosAddCircle />
                Tạo tour mới
              </span>
            </li>
          </Link>
          {/* <Link to={""}>
            <li className={`${styles.title} ${isNav == 4 ? styles.show : ""}`}>
              <span >Tạo tour tự động</span>
            </li>
          </Link> */}
        </ul>
      )}
    </nav>
  );
};

export default NavTour;
