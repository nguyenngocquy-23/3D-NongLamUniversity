import { Routes, Route } from "react-router-dom";
import Login from "./pages/auths/Login.tsx";
import Register from "./pages/auths/Register.tsx";
import ForgotPassword from "./pages/auths/ForgotPassword.tsx";
import Home from "./pages/visitor/Home.tsx";
import TourVirtual from "./pages/visitor/TourVirtual.tsx";
import Dashboard from "./components/admin/Dashboard.tsx";
import User from "./pages/admin/User.tsx";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/tourVirtual" element={<TourVirtual />} />

      {/* admin */}
      <Route path="/admin" element={<Dashboard />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<User />} />
      </Route>
    </Routes>
  );
}

export default RouterConfig;
