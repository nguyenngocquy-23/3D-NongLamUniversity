import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/user.module.css";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/Store";
import { MdAdminPanelSettings } from "react-icons/md";
import { Datatable } from "../../components/admin/DataTable";
import { fetchContacts, fetchUsers } from "../../redux/slices/DataSlice";
import { API_URLS } from "../../env";
import { IoSearch } from "react-icons/io5";
import FeedbackBox from "../../components/admin/FeedbackBox";
import { FaEdit } from "react-icons/fa";

interface Contact {
  id: number;
  email: string;
  content: string;
  status: number;
}

function ManagerContact() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentContent, setCurrentContent] = useState<string>("");
  const [openFeedback, setOpenFeedback] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const contacts = useSelector((state: RootState) => state.data.contacts) || [];
  const [searchData, setSearchData] = useState<Contact[]>([]);

  const [contactSelected, setContactSelected] = useState<Contact | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (
      currentUser == undefined ||
      currentUser == null ||
      (currentUser && currentUser.roleId !== 2 && currentUser.roleId !== 3)
    ) {
      navigate("/unauthorized");
    } else {
      setLoading(true);
      dispatch(fetchUsers());
    }
  }, [currentUser, navigate, dispatch]);

  // Cập nhật searchData mỗi khi users thay đổi
  useEffect(() => {
    if (contacts.length > 0) {
      setSearchData(contacts); // Chỉ cập nhật khi contacts có dữ liệu
    }
    setLoading(false); // Kết thúc trạng thái tải
  }, [contacts]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = contacts.filter((row: any) => {
      return row.email.toLowerCase().includes(searchTerm);
    });
    setSearchData(newData);
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Contact) => row.id,
      sortable: true,
      width: "70px",
    },
    {
      name: "Email",
      selector: (row: Contact) => row.email,
      sortable: true,
    },
    {
      name: "Nội dung",
      selector: (row: Contact) => row.content,
      grow: 2,
      width: "500px",
    },
    {
      name: "Trạng thái",
      selector: (row: Contact) => (
        <span
          className={`${styles.status} ${row.status == 1 && styles.completed}`}
        >
          {row.status == 0 ? "Chưa phản hồi" : "Đã phản hồi"}
        </span>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: "Tác vụ",
      cell: (row: Contact) => (
        <button
          className={`${styles.status_button} ${
            row.status == 1 && styles.completed
          }`}
          onClick={() => {
            setOpenFeedback(true);
            setCurrentContent(row.content);
            setContactSelected(row);
          }}
          title={row.status == 0 ? "phản hồi" : "phản hồi lại"}
        >
          <FaEdit />
        </button>
      ),
      width: "120px",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.search_box}>
        <label htmlFor="input" className={styles.label}>
          <IoSearch className={styles.search_icon} />
        </label>
        <input
          type="text"
          name="field"
          id="input"
          placeholder="Tìm kiếm..."
          className={styles.search_input}
          onChange={handleSearch}
        />
      </div>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {openFeedback && (
        <FeedbackBox
          contactId={contactSelected ? contactSelected.id : 0}
          email={contactSelected ? contactSelected.email : ""}
          setOpenFeedback={setOpenFeedback}
          currentContent={currentContent}
        />
      )}
      <Datatable columns={columns} searchData={searchData!} loading={loading} />
    </div>
  );
}

export default ManagerContact;
