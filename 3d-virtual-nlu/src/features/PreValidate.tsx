import Swal from "sweetalert2";
import { Navigate, useNavigate } from "react-router-dom";

export const validateAndNavigate = (
  fields: { value: any; name: string }[],
  navigatePath: string,
  errorMessage: string,
) => {
  const navigate = useNavigate();
  // Kiểm tra nếu có giá trị bị null, undefined, hoặc rỗng
  const invalidField = fields.find(
    (field) => !field.value || field.value === ""
  );

  if (invalidField) {
    Swal.fire({
      title: "Lỗi!",
      text: `${errorMessage}`,
      icon: "error",
      confirmButtonColor: "#d33",
      timer: 4000,
      timerProgressBar: true,
      allowOutsideClick: false,
      didClose: () => {
        navigate(navigatePath);
      },
    });
    return false; // Ngăn tiếp tục thực thi
  }

  return true; // Nếu hợp lệ
};
