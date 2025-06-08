import styles from "../../styles/chat.module.css";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

interface DataTableProps{
  columns: any[];
  searchData: any[];
  loading: boolean;
}

export const Datatable: React.FC<DataTableProps> = ({columns, searchData, loading}) => {
  return (
    <div className={styles.dataTable}>
      <DataTable
        columns={columns}
        data={[...searchData]}
        progressPending={loading}
        pagination
        highlightOnHover
        noDataComponent="Không có dữ liệu để hiển thị"
        customStyles={{
          headCells: {
            style: {
              fontSize: "17px",
              background: "#009879",
              color: "#ffffff",
              textAlign: "left",
              fontWeight: "bold",
            },
          },
          cells: {
            style: {
              borderCollapse: "collapse",
              fontSize: "15px",
              whiteSpace: "normal",
              wordWrap: "break-word",
              height: "auto",
            },
          },
        }}
      />
    </div>
  );
};
