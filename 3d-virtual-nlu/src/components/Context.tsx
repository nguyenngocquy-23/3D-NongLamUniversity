import { createContext, useState, ReactNode, useContext } from "react";

// Định nghĩa kiểu dữ liệu của người dùng
interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

// Định nghĩa kiểu dữ liệu của UserContext
interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
}

// Tạo Context với giá trị mặc định
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider để bọc ứng dụng
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") || "null") // Lấy user từ localStorage khi tải lại trang
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook để dễ dàng sử dụng UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser phải được sử dụng bên trong UserProvider");
  }
  return context;
};
