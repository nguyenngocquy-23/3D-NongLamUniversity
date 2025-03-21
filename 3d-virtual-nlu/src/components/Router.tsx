import { Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Register from "./register/Register";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import Home from "./HomePage/Home";
import TourVirtual from "./HomePage/tour/TourVirtual";
import Dashboard from "./admin/dashboard/Dashboard.tsx";
import User from "./admin/user/User.tsx";

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
