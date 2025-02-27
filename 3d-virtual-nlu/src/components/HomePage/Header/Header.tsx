import style from "./header.module.css"; // Why is this import necessary when we're using CSS modules?

// module CSS?

const Header = () => {
  return (
    <header className={style.header}>
      <img
        src="https://upload.wikimedia.org/wikipedia/vi/thumb/e/e1/Logo_HCMUAF.svg/900px-Logo_HCMUAF.svg.png?20230506055905"
        alt="University Logo"
        className="logo"
      />

      <nav className={style.nav}>
        <a href="#" className={style.navLink}>
          Thông tin tuyển sinh
        </a>
        <a href="#" className={style.navLink}>
          Sơ đồ trường
        </a>
        <a href="#" className={style.navLink}>
          Chương trình đào tạo
        </a>
        <a href="#" className={style.navLink}>
          Trải nghiệm ảo
        </a>

        <a href="#" className={style.navLink}>
          Đăng nhập
        </a>
      </nav>
    </header>
  );
};

export default Header;
