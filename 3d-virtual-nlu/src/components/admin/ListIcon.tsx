import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import styles from "../../styles/listIcon.module.css";
import { IoIosCloseCircle } from "react-icons/io";

const ListIcon = ({
  setIconId,
  setOpen,
}: {
  setIconId: (val: number) => void;
  setOpen: (val: boolean) => void;
}) => {
  const icons = useSelector((state: RootState) => state.data.icons);

  const [searchData, setSearchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    const newData = icons.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  useEffect(() => {
    if (icons.length > 0) {
      setSearchData(icons); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [icons]);
  return (
    <div className={styles.container}>
      <IoIosCloseCircle
        className={styles.close_button}
        onClick={() => {
          setOpen(false);
        }}
      />
      <label>Biểu tượng</label>
      <div>
        <div>
          <input
            type="text"
            title="Tên biểu tượng"
            onChange={handleSearch}
            placeholder="Tìm kiếm..."
            // className={stylesCommon.search_input}
          />
        </div>
        <div className={styles.icons_container}>
          {searchData.map((icon, index) => (
            <div key={index} className={styles.icon_container} onClick={()=> {setIconId(icon.id)}}>
              <div
                className={styles.icon_image}
                style={{ backgroundImage: `url(${icon.url})` }}
              />
              <span className={styles.icon_name}>{icon.name}</span>
            </div>
          ))}
          {searchData.length == 0 ? " Không tìm thấy biểu tượng " : ""}
        </div>
      </div>
    </div>
  );
};

export default ListIcon;
