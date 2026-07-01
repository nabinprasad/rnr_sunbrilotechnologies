import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../../socket";
import { getQuizSession } from "../../api/quizSessionApi";
import { getEmployeeStatus } from "../../api/employeeApi";

export default function EmployeeHome() {
  const navigate = useNavigate();


  // Declare employee FIRST
  const employee = JSON.parse(
    localStorage.getItem("employee") || "{}"
  );

  // Then use it
  const [employeeData, setEmployeeData] = useState(employee);
  const [session, setSession] = useState(null);

useEffect(() => {
  loadEmployee();
  loadSession(); // Load current session immediately

  // Until quiz session is moved to Socket.IO, keep polling it
  const interval = setInterval(() => {
    loadSession();
  }, 3000);

  const employee = JSON.parse(localStorage.getItem("employee") || "{}");

  if (employee?._id) {
    socket.emit("joinEmployee", employee._id);
  }

  socket.on("employeeApproved", (data) => {
    localStorage.setItem(
      "employee",
      JSON.stringify(data.employee)
    );

    setEmployeeData(data.employee);

    navigate("/employee/lobby");
  });

  return () => {
    clearInterval(interval);
    socket.off("employeeApproved");
  };
}, [navigate]);

  const loadSession = async () => {
    try {
      const res = await getQuizSession();
      setSession(res.data.session);
    } catch (err) {
      console.log(err);
    }
  };
const loadEmployee = async () => {
  try {
    const employee = JSON.parse(localStorage.getItem("employee"));

    if (!employee?._id) return;

    const res = await getEmployeeStatus(employee._id);

    localStorage.setItem(
      "employee",
      JSON.stringify(res.data.employee)
    );

    setEmployeeData(res.data.employee);

    console.log(
      "Approval:",
      res.data.employee.approvalStatus
    );
  } catch (err) {
    console.log(err);
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg text-center">

        <img
          src={employeeData.photo || "https://i.pravatar.cc/150"}
          alt={employeeData.name}
          className="w-28 h-28 rounded-full mx-auto object-cover"
        />

        <h2 className="text-3xl font-bold mt-5">
          Welcome
        </h2>

        <h1 className="text-2xl mt-2">
          {employeeData.name}
        </h1>

        <p className="text-gray-500">
          {employeeData.department}
        </p>

        {/* Waiting For Admin */}

        {employeeData.approvalStatus !== "Approved" && (

          <div className="mt-8 bg-yellow-100 border border-yellow-300 rounded-xl p-6">

            <h2 className="text-xl font-bold text-yellow-700">
              Waiting For Admin Approval
            </h2>

            <p className="mt-3 text-gray-600">
              Your join request has been sent successfully.
            </p>

          </div>

        )}

        {/* Approved */}

        {employeeData.approvalStatus === "Approved" && (

          <div className="mt-8">

            {session?.status === "Waiting" && (

              <>
                <div className="bg-blue-50 rounded-xl p-6">

                  <h2 className="text-xl font-bold">
                    Waiting For Host...
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Event will begin shortly.
                  </p>

                </div>

                <Link
                  to="/employee/lobby"
                  className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  Enter Event Lobby
                </Link>

              </>

            )}

            {session?.status === "Live" && (

              <div className="bg-green-100 rounded-xl p-6">

                <h2 className="text-2xl font-bold text-green-700">
                  Quiz is Live 🎉
                </h2>

                <p className="mt-3">
                  Click below to participate.
                </p>

                <button
                  onClick={() =>
                    navigate("/employee/live-quiz")
                  }
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
                >
                  Join Live Quiz
                </button>

              </div>

            )}

            {session?.status === "Finished" && (

              <div className="bg-orange-100 rounded-xl p-6">

                <h2 className="text-2xl font-bold text-orange-700">
                  Quiz Finished 🎉
                </h2>

                <p className="mt-3">
                  Thank you for participating.
                </p>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}