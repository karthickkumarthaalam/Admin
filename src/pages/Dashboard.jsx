import React from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import DashboardContent from "../components/DashboardStats";
import BreadCrumb from "../components/BreadCrum";
import CopyrightFooter from "../components/CopyRightsComponent";

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />
        <BreadCrumb title={"Dashboard"} paths={["Dashboard"]} />
        <div className="flex-1 overflow-y-auto">
          <DashboardContent />
        </div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Dashboard;
