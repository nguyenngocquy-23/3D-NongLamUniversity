import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Register from "./register/Register";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import Home from "./HomePage/Home";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
    </Routes>
  );
}

export default RouterConfig;
