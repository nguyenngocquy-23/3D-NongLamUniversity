import { Routes, Route } from "react-router-dom";
import Login from "./pages/auths/Login.tsx";
import Register from "./pages/auths/Register.tsx";
import ForgotPassword from "./pages/auths/ForgotPassword.tsx";
import Home from "./pages/visitor/Home.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";

import User from "./pages/admin/User.tsx";
import Layout from "./components/admin/Layout.tsx";
import CreateTour from "./features/CreateTour.tsx";
import ManagerTour from "./pages/admin/BoardFeatureTour.tsx";
import CreateTourStep2 from "./pages/admin/CreateTourStep2.tsx";
import CreateTourStep3 from "./pages/admin/CreateTourStep3.tsx";
import CreateTourStep4 from "./pages/admin/CreateTourStep4.tsx";
import PageNotFound from "./pages/Page404.tsx";
import VirtualTour from "./pages/visitor/VirtualTour.tsx";
import Field from "./pages/admin/ManagerField.tsx";
import Space from "./pages/admin/ManagerSpace.tsx";
import ManageNode from "./pages/admin/ManagerTour.tsx";
import UpdateNode from "./features/UpdateTour.tsx";
import Model from "./components/admin/Model.tsx";
import ManagerIcon from "./pages/admin/ManagerIcon.tsx";
import Verify from "./pages/auths/Verify.tsx";
import VisitorDashBoard from "./pages/visitor/VisitorDashBoard.tsx";
import VisitorManage from "./pages/visitor/Manage.tsx";
import VisitorCreateTour from "./pages/visitor/CreateTour.tsx";

function RouterConfig() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/virtualTour" element={<VirtualTour />} />
      <Route path="/manage/" element={<VisitorManage />}>
        <Route index element={<VisitorDashBoard />} />
        <Route path="createTour" element={<VisitorCreateTour />} />
      </Route>
      {/* admin */}
      <Route path="/admin/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tours" element={<ManagerTour />} />
        <Route path="users" element={<User />} />
        <Route path="fields" element={<Field />} />
        <Route path="spaces" element={<Space />} />
        <Route path="icons" element={<ManagerIcon />} />
        <Route path="createTour" element={<CreateTour />} />
        <Route path="createTour/2" element={<CreateTourStep2 />} />
        <Route path="createTour/3" element={<CreateTourStep3 />} />
        <Route path="createTour/4" element={<CreateTourStep4 />} />
        <Route path="manageTour" element={<ManageNode />} />
        <Route path="updateTour" element={<UpdateNode />} />
        <Route path="model" element={<Model />} />
      </Route>
      {/* Nếu URL không đúng, điều hướng đến trang lỗi */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default RouterConfig;
