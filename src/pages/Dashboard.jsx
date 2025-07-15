import DashboardContent from "../components/DashboardStats";
import BreadCrumb from "../components/BreadCrum";

const Dashboard = () => {
  return (
    <>
      <BreadCrumb title={"Dashboard"} paths={["Dashboard"]} />
      <div className="flex-1 overflow-y-auto">
        <DashboardContent />
      </div>
    </>
  );
};

export default Dashboard;
