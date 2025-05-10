import React from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";

const Subscribers = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />
        <BreadCrumb title={"Subscribers"} paths={["Programs", "Users List"]} />
      </div>
    </div>
  );
};

export default Subscribers;
