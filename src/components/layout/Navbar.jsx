import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Navbar({
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();

  const { admin, logout } = useContext(AuthContext);

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    logout();

    toast.success("Logged out successfully");

    navigate("/admin/login");
  };

  return (
    <header className="bg-white h-16 shadow flex items-center justify-between px-4 md:px-8">

      {/* Left Section */}
      <div className="flex items-center gap-4">

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-2xl text-slate-700"
        >
          <FaBars />
        </button>

        <h2 className="text-lg md:text-xl font-semibold text-slate-800">
          Reward & Recognition
        </h2>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-5">

        <div className="hidden sm:flex items-center gap-2">

          <FaUserCircle className="text-3xl text-blue-600" />

          <div>
            <p className="font-semibold">
              {admin?.name || "Admin"}
            </p>

            <p className="text-xs text-gray-500">
              {admin?.email}
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg transition"
        >
          <FaSignOutAlt />
          <span className="hidden sm:inline">
            Logout
          </span>
        </button>

      </div>

    </header>
  );
}