import React, { useState } from "react";
import { apiCall } from "../utils/apiCall";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { setuser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setIsLoading(true);
    try {
      let data = await apiCall("/auth/login", "POST", form);
      sessionStorage.setItem(
        "user",
        JSON.stringify({ ...data.user, loginTime: new Date().getTime() })
      );
      setuser(data.user);

      const cleanedPermissions = data.user.permissions.map((perm) => ({
        ...perm,
        access_type: perm.access_type[0].split(","),
      }));

      sessionStorage.setItem("permissions", JSON.stringify(cleanedPermissions));
      navigate("/dashboard");
      toast.success("Login successful!");
    } catch (err) {
      toast.error("Login failed. Please check your credentials!");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";

    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  return (
    <div
      className="flex h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/A8J3K9Z5QW/background_image.jpg')",
      }}
    >
      <form
        onSubmit={handleLogin}
        className=" p-12 rounded-lg shadow-lg w-[450px] space-y-6 backdrop-blur-sm"
      >
        <div className="flex justify-center">
          <img
            src={`${window.location.origin}/A8J3K9Z5QW/thalam-logo.png`}
            alt="Thaalam Logo"
            className="w-36 h-36 object-contain mb-2"
          />
        </div>
        <h2 className="text-3xl font-medium text-center text-red-600">
          Welcome
        </h2>

        {/* Email Field */}
        <div className="relative">
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
              errors.email ? "focus:ring-red-800" : "focus:ring-red-500"
            }`}
          />
          <label
            htmlFor="email"
            className={`absolute left-3 top-4 text-md transition-all ${
              errors.email ? "text-red-500" : "text-gray-500"
            } peer-focus:top-1 peer-focus:text-xs peer-focus:${
              errors.email ? "text-red-500" : "text-gray-500"
            }  peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
          >
            Email
          </label>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
              errors.password ? "focus:ring-red-800" : "focus:ring-red-500"
            }`}
          />
          <label
            htmlFor="password"
            className={`absolute left-3 top-4 text-md transition-all ${
              errors.password ? "text-red-500" : "text-gray-500"
            } peer-focus:top-1 peer-focus:text-xs peer-focus:${
              errors.password ? "text-red-500" : "text-gray-500"
            }  peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-5 focus:outline-none text-gray-600"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <p className="text-right text-sm">
          <Link to="/forgot-password" className="text-red-600 hover:underline">
            Forgot Password ?
          </Link>
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors duration-200
              ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              } text-white`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default LoginPage;
