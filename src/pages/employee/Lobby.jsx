import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployeeStatus } from "../../api/employeeApi";
import { getEvent } from "../../api/eventApi";

export default function Lobby() {
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem("employee"))
  );

  const [event, setEvent] = useState(null);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    loadEmployee();
    loadEvent();

    const interval = setInterval(() => {
      loadEmployee();
      loadEvent();

      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadEmployee = async () => {
    try {
      const res = await getEmployeeStatus(employee._id);

      setEmployee(res.data.employee);

      localStorage.setItem(
        "employee",
        JSON.stringify(res.data.employee)
      );

      // Employee approved
      if (res.data.employee.approvalStatus === "Approved") {
        navigate("/employee/home");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadEvent = async () => {
    try {
      const res = await getEvent();
      setEvent(res.data.event);
    } catch (err) {
      console.log(err);
    }
  };

  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-10">

        <div className="text-center">
          <img
            src={employee?.photo || "https://i.pravatar.cc/150"}
            className="w-32 h-32 rounded-full mx-auto border-4 border-blue-600"
          />

          <h1 className="text-4xl font-bold mt-5">
            Welcome
          </h1>

          <h2 className="text-2xl mt-2">
            {employee?.name}
          </h2>

          <p className="text-gray-500">
            {employee?.department}
          </p>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-xl font-semibold">
            Event Starts In
          </h3>

          <div className="text-7xl font-bold text-blue-700 mt-5">
            {minutes}:{seconds}
          </div>
        </div>

        <div className="mt-10 bg-blue-50 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold">
            Waiting for Host...
          </h2>

          <p className="mt-3 text-gray-600">
            Approval Status :
            <span className="font-bold">
              {" "}
              {employee?.approvalStatus}
            </span>
          </p>

          <p className="mt-2 text-gray-600">
            Event Status :
            <span className="font-bold">
              {" "}
              {event?.status || "Waiting"}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}