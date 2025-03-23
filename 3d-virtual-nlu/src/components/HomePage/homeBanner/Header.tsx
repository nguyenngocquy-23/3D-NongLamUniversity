import { Link } from "react-router-dom";
import style from "./header.module.css"; // Import cần thiết khi sử dụng CSS Modules
import { Button, Link as ScrollLink } from "react-scroll";
const Header: React.FC = () => {
  return (
    <header className={style.header}>
      <img
        src="https://upload.wikimedia.org/wikipedia/vi/thumb/e/e1/Logo_HCMUAF.svg/900px-Logo_HCMUAF.svg.png?20230506055905"
        alt="University Logo"
        className="logo"
      />

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

        <Link to="/tourManager" className={style.navLink}>
          Quản lý Tour
        </Link>

        <Link to="/login" className={style.navLink}>
          Đăng nhập
        </Link>
      </nav>
    </header>
  );
};

export default Header;
