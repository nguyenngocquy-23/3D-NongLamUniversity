import { Link } from "react-router-dom";
import style from "../../styles/header.module.css";

import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/Store.ts";
import { logoutUser } from "../../redux/slices/AuthSlice.ts";

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser()); // Gọi action logout
    navigate("/login");
  };

  return (
    <header className={style.header}>
      <div className={style.logo_container}>
        <img
          src="https://upload.wikimedia.org/wikipedia/vi/thumb/e/e1/Logo_HCMUAF.svg/900px-Logo_HCMUAF.svg.png?20230506055905"
          alt="University Logo"
          className={style.logo}
        />
        <span className={style.name}>TRƯỜNG ĐẠI HỌC NÔNG LÂM TP.HCM</span>
      </div>

      <nav className={style.nav}>
        <ScrollLink
          to="campusMap"
          className={style.navLink}
          smooth={true}
          duration={500}
        >
          Sơ đồ trường
        </ScrollLink>

        <ScrollLink
          to="tourOverview"
          className={style.navLink}
          smooth={true}
          duration={500}
        >
          Khám phá tour ảo
        </ScrollLink>

        <a href="#" className={style.navLink}>
          Chương trình đào tạo
        </a>
        <a href="/createTour" className={style.navLink}>
          Thêm không gian
        </a>

        {user ? (
          <div className={style.dropdown}>
            <button
              className={style.dropdownBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              👤 {user.username}
            </button>

            {dropdownOpen && (
              <ul className={style.dropdownMenu}>
                <li>
                  <button className={style.dropdownBtn}>
                    <Link to="/profile">Hồ sơ</Link>
                  </button>
                </li>
                <li>
                  <button className={style.dropdownBtn} onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login" className={style.navLink}>
            Đăng nhập
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
