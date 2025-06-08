import { useEffect, useState } from "react";
import { FaAngleLeft, FaCaretDown, FaCaretUp } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/visitor/navTour.module.css";

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

  useEffect(() => {
    if (location.pathname === "/manage") {
      setIsNav(1);
    } else if (location.pathname === "/manage/tours") {
      setIsNav(2);
    } else if (location.pathname === "/manage/createTour") {
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
        height: isOpen ? "10%" : undefined,
      }}
    >
      {isOpen ? (
        <span
          className={styles.backBtn}
          onClick={() => {
            navigate("/");
          }}
        >
          <FaAngleLeft />
        </span>
      ) : (
        ""
      )}
      <span className={styles.toggle} onClick={handleToggle}>
        {isOpen ? <FaCaretUp /> : <FaCaretDown />}
      </span>

      {isOpen && (
        <ul
          style={{
            marginTop: isOpen ? undefined : "30px",
          }}
        >
          <Link to={"/manage/"} onClick={() => setIsNav(1)}>
            <li className={`${styles.title} ${isNav == 1 ? styles.show : ""}`}>
              <span>Thống kê</span>
            </li>
          </Link>
          <Link to={"/manage/tours"} onClick={() => setIsNav(2)}>
            <li className={`${styles.title} ${isNav == 2 ? styles.show : ""}`}>
              <span>Các tour đã tạo</span>
            </li>
          </Link>
          <Link to={"/manage/createTour"} onClick={() => setIsNav(3)}>
            <li className={`${styles.title} ${isNav == 3 ? styles.show : ""}`}>
              <span>Tạo tour mới</span>
            </li>
          </Link>
          <Link to={"/manage/profile"} onClick={() => setIsNav(4)}>
            <li className={`${styles.title} ${isNav == 4 ? styles.show : ""}`}>
              <span>Thông tin cá nhân</span>
            </li>
          </Link>
        </ul>
      )}
      <div className={styles.info}>
        {isOpen && (
          <>
            <img src={user.avatar !== "" || user.avatar !== null ? user.avatar : "/avatar.jpg"} alt="" />
            <div className={styles.admin_info}>
              <Link to="/">
                <h5>{user.username} !</h5>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavTour;
