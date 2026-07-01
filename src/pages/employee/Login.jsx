import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployees } from "../../api/employeeApi";
import toast from "react-hot-toast";
import { joinEmployee } from "../../api/employeeApi";
import socket from "../../socket";

export default function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await joinEmployee(employeeId);
      localStorage.setItem("employee", JSON.stringify(res.data.employee));

      // Join personal socket room
      socket.emit("joinEmployee", res.data.employee._id);


      toast.success(res.data.message);

      navigate("/employee/lobby");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-700 to-purple-700 flex justify-center items-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[420px]">
        <h1 className="text-3xl font-bold text-center mb-8">
          Reward & Recognition
        </h1>

        <input
          type="text"
          placeholder="Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border rounded-xl p-4 w-full mb-5"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-3 rounded-xl"
        >
          Join Event
        </button>
      </div>
    </div>
  );
}
