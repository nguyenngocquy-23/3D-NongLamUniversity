import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Register from "./register/Register";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import Home from "./HomePage/Home";
import TourVirtual from "./HomePage/tour/TourVirtual";
import TourManager from "./TourManager/TourManager";
import DashBoard from "./Admin/DashBoard/DashBoard";
import AdminDashBoard from "./Admin/AdminDashBoard/AdminDashBoard";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/tourVirtual" element={<TourVirtual />} />
      <Route path="/tourManager" element={<TourManager />} />
      <Route path="/admin" element={<AdminDashBoard />} />
    </Routes>
  );
}

export default RouterConfig;
