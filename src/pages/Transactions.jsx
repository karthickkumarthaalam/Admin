import React from "react";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import BreadCrumb from "../components/BreadCrum";

const Transactions = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />
        <BreadCrumb
          title={"Transactions"}
          paths={["Programs", "Transactions List"]}
        />
      </div>
    </div>
  );
};

export default Transactions;
