import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../components/context/AuthContext";
import { loginAdmin } from "../../api/authApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await loginAdmin(formData);

      login(res.data.admin, res.data.token);

      toast.success("Login Successful");

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Invalid Email or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-10 mb-4">
            <img
              src="/sunbrilologo.png"
              alt="Sunbrilo"
              className="h-14 object-contain"
            />

            <img
              src="/riskonnectlogo.png"
              alt="Riskonnect"
              className="h-14 object-contain"
            />
          </div>

          <p className="text-gray-500">
            Reward & Recognition Portal
          </p>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Admin Login
        </h2>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-left">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="admin@gmail.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2 text-left">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Remember */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember Me
          </label>

          <button
            type="button"
            className="text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 transition disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 Sunbrilo Technologies
        </p>
      </form>
    </div>
  );
}