import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/Login";
import Tour from "./tour/Tour";
import Register from "./register/Register";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import VirtualTour from "./HomePage/tourOverview/TourOverview";
import Home from "./HomePage/Home";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/tour" element={<Tour />} />
    </Routes>
  );
}

export default RouterConfig;
