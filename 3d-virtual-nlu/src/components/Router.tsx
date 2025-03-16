import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Register from "./register/Register";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import Home from "./HomePage/Home";
import TourVirtual from "./HomePage/tour/TourVirtual";
import Chat from "./socket/Chat.tsx";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/tourVirtual" element={<TourVirtual />} />
    </Routes>
  );
}

export default RouterConfig;
