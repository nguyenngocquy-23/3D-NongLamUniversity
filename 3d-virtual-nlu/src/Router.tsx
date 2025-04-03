import { Routes, Route } from "react-router-dom";
import Login from "./pages/auths/Login.tsx";
import Register from "./pages/auths/Register.tsx";
import ForgotPassword from "./pages/auths/ForgotPassword.tsx";
import Home from "./pages/visitor/Home.tsx";
import TourVirtual from "./pages/visitor/TourVirtual.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";

import User from "./pages/admin/User.tsx";
import Layout from "./components/admin/Layout.tsx";
import CreateTour from "./features/CreateTour.tsx";
import UpdateTour from "./features/UpdateTour.tsx";
import ManagerTour from "./pages/admin/ManagerTour.tsx";
import CreateTourStep2 from "./pages/admin/CreateTourStep2.tsx";
import CreateTourStep3 from "./pages/admin/CreateTourStep3.tsx";
import CreateTourStep4 from "./pages/admin/CreateTourStep4.tsx";
import PageNotFound from "./pages/Page404.tsx";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/virtualTour" element={<TourVirtual />} />
      {/* admin */}
      <Route path="/admin/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tours" element={<ManagerTour />} />
        <Route path="users" element={<User />} />
        <Route path="fields" element={<User />} />
        <Route path="spaces" element={<User />} />
        <Route path="createTour" element={<CreateTour />} />
        <Route path="createTour/2" element={<CreateTourStep2 />} />
        <Route path="createTour/3" element={<CreateTourStep3 />} />
        <Route path="createTour/4" element={<CreateTourStep4 />} />
        <Route path="updateTour" element={<UpdateTour />} />
      </Route>
      {/* Nếu URL không đúng, điều hướng đến trang lỗi */}
      <Route path="*" element={<PageNotFound/>}/>
    </Routes>
  );
}

export default RouterConfig;
