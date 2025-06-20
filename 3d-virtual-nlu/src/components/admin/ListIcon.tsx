import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";
import styles from "../../styles/listIcon.module.css";
import { IoIosCloseCircle } from "react-icons/io";

const ListIcon = ({
  setIconId,
  setOpen,
  typeIcon,
}: {
  setIconId: (val: number) => void;
  setOpen: (val: boolean) => void;
  typeIcon: number;
}) => {
  const icons = useSelector((state: RootState) => state.data.icons);

  const [searchData, setSearchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    const newData = icons.filter((row) => {
      return (
        row?.type === typeIcon && row.name.toLowerCase().includes(searchTerm)
      );
    });
    setSearchData(newData);
  };

  useEffect(() => {
    if (icons.length > 0) {
      const filteredIcons = icons.filter((i) => i?.type === typeIcon);
      setSearchData(filteredIcons); // Chỉ cập nhật khi users có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [icons, typeIcon]);

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <IoIosCloseCircle
          className={styles.close_button}
          onClick={() => {
            setOpen(false);
          }}
        />

        <div>
          <input
            className={styles.search_input}
            type="text"
            title="Tên biểu tượng"
            onChange={handleSearch}
            placeholder="Tìm kiếm..."
            // className={stylesCommon.search_input}
          />
        </div>
      </div>
      <div>
        <div className={styles.icons_container}>
          {searchData.map((icon, index) => (
            <div
              key={index}
              className={styles.icon_container}
              onClick={() => {
                setIconId(icon.id);
                setOpen(false);
              }}
            >
              <div
                className={styles.icon_image}
                style={{
                  backgroundImage: `url(${
                    typeIcon === 1 ? icon.url : icon.thumbnail
                  })`,
                }}
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
