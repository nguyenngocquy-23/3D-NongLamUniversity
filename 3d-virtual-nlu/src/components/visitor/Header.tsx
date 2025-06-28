import { Link } from "react-router-dom";
import style from "../../styles/header.module.css";

import { Link as ScrollLink } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store.ts";
import { logoutUser } from "../../redux/slices/AuthSlice.ts";
import Swal from "sweetalert2";

const Header: React.FC = () => {
  const userJson = sessionStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser()); // Gọi action logout
    navigate("/login");
  };

  const handleManage = (e: React.MouseEvent) => {
    e.preventDefault(); // chặn chuyển hướng mặc định nếu dùng <a>
    if (currentUser) {
      navigate("/manage");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập",
        text: "Vui lòng đăng nhập để tiếp tục.",
        showCancelButton: true,
        cancelButtonText: "Hủy",
        confirmButtonText: "Đăng nhập",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    }
  };

  useEffect(() => {
    const links = document.querySelectorAll(`.${style.navLink}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(style.visible);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    links.forEach((link) => observer.observe(link));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className={style.header}>
      <div className={style.logo_container}>
        {isMobile && (
          <button
            className={style.menu_button}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            ☰
          </button>
        )}
        <img
          src="https://upload.wikimedia.org/wikipedia/vi/thumb/e/e1/Logo_HCMUAF.svg/900px-Logo_HCMUAF.svg.png?20230506055905"
          alt="University Logo"
          className={style.logo}
        />
        <span className={style.name}>NLU</span>
      </div>

      {(mobileNavOpen || !isMobile) && (
        <nav className={isMobile ? style.nav_mobile : style.nav}>
          <ScrollLink
            to="campusMap"
            className={style.navLink}
            offset={-60}
            smooth={true}
            duration={800}
            onClick={() => setMobileNavOpen(false)}
          >
            Sơ đồ trường
          </ScrollLink>

          <ScrollLink
            to="introduce"
            className={style.navLink}
            smooth={true}
            duration={800}
            onClick={() => setMobileNavOpen(false)}
          >
            Giới thiệu
          </ScrollLink>

          <ScrollLink
            to="tourOverview"
            className={style.navLink}
            smooth={true}
            duration={800}
            onClick={() => setMobileNavOpen(false)}
          >
            Khám phá tour ảo
          </ScrollLink>

          <ScrollLink
            to="contact"
            className={style.navLink}
            smooth={true}
            offset={-40}
            duration={800}
            onClick={() => setMobileNavOpen(false)}
          >
            Liên hệ
          </ScrollLink>

          {!isMobile && (
            <span
              onClick={handleManage}
              className={style.navLink}
              style={{ cursor: "pointer" }}
            >
              Thêm không gian
            </span>
          )}
        </nav>
      )}
      {!isMobile && currentUser ? (
        <div className={style.dropdown}>
          <button
            className={style.dropdownBtn}
            onClick={() => {
              currentUser.username === "admin"
                ? navigate("/admin")
                : setDropdownOpen(!dropdownOpen);
            }}
          >
            <img src={currentUser.avatar || ""} /> {currentUser.username}
          </button>

          {dropdownOpen && (
            <ul className={style.dropdownMenu}>
              <li>
                <button className={style.dropdownBtn}>
                  <Link to="/manage/">Hồ sơ</Link>
                </button>
              </li>
              <li>
                <button className={style.dropdownBtn} onClick={handleLogout}>
                  <Link to="">Đăng xuất</Link>
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : (
        !isMobile && (
          <div>
            <Link to="/login" className={style.navLink}>
              Đăng nhập
            </Link>
            <Link to="/register" className={style.register_button}>
              Đăng ký
            </Link>
          </div>
        )
      )}
    </header>
  );
};

export default Header;
