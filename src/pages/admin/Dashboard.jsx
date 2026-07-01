import { useEffect, useState } from "react";
import {
  FaUsers,
  FaQuestionCircle,
  FaAward,
  FaCertificate,
  FaPlayCircle,
} from "react-icons/fa";

import AdminLayout from "../../components/layout/AdminLayout";
import DashboardCard from "../../components/dashboard/DashboardCard";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";

import { getEmployees } from "../../api/employeeApi";
import { getEvent } from "../../api/eventApi";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [event, setEvent] = useState({
    status: "Waiting",
    currentActivity: "-",
    hostMessage: "",
  });

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const empRes = await getEmployees();
      setEmployees(empRes.data.employees);

      const eventRes = await getEvent();

      if (eventRes.data.event) {
        setEvent(eventRes.data.event);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Reward & Recognition Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Live Event Monitoring
        </p>

      </div>

      {/* Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <DashboardCard
          title="Employees"
          value={employees.length}
          icon={<FaUsers />}
          color="bg-blue-600"
        />

        <DashboardCard
          title="Active Employees"
          value={
            employees.filter(
              (emp) => emp.status === "Active"
            ).length
          }
          icon={<FaUsers />}
          color="bg-green-600"
        />

        <DashboardCard
          title="Current Activity"
          value={event.currentActivity || "-"}
          icon={<FaQuestionCircle />}
          color="bg-orange-500"
        />

        <DashboardCard
          title="Event Status"
          value={event.status}
          icon={<FaPlayCircle />}
          color={
            event.status === "Live"
              ? "bg-green-600"
              : event.status === "Finished"
              ? "bg-red-600"
              : "bg-purple-600"
          }
        />

      </div>

      {/* Event Information */}

      <div className="bg-white rounded-xl shadow mt-8 p-6">

        <h2 className="text-2xl font-bold mb-5">
          Current Event
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <p className="text-gray-500">
              Status
            </p>

            <h3 className="text-xl font-bold">
              {event.status}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Activity
            </p>

            <h3 className="text-xl font-bold">
              {event.currentActivity || "-"}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Host Message
            </p>

            <h3 className="text-lg">
              {event.hostMessage || "No Message"}
            </h3>

          </div>

        </div>

      </div>

      <QuickActions />

      <RecentActivity />

    </AdminLayout>
  );
}