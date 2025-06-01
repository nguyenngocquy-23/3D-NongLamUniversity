import { useState } from "react";
import { FaAngleLeft, FaCaretDown, FaCaretUp } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <nav
      className={styles.container}
      style={{
        height: isOpen ? "15%" : undefined,
      }}
    >
      {isOpen ? (
        <span
          className={styles.backBtn}
          onClick={() => {
            navigate(-1);
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

      <ul
        style={{
          marginTop: isOpen ? undefined : "30px",
        }}
      >
        <Link to={"/manage/"}>
          <li className={styles.title}>{isOpen && <span>Thống kê</span>}</li>
        </Link>
        <Link to={"/manage/createTour"}>
          <li className={styles.title}>
            {isOpen && <span>Các tour đã tạo</span>}
          </li>
        </Link>
        <Link to={"/manage/createTour"}>
          <li className={styles.title}>
            {isOpen && <span>Tạo tour mới</span>}
          </li>
        </Link>
        <Link to={"/manage/createTour"}>
          <li className={styles.title}>
            {isOpen && <span>Thông tin cá nhân</span>}
          </li>
        </Link>
      </ul>
      <div className={styles.info}>
        {isOpen && (
          <>
            <img src="/public/avatar.jpg" alt="" />
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
