import React, { useState } from "react";
import { apiCall } from "../utils/apiCall";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Confirm Password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await apiCall("/auth/signup", "POST", form);
      toast.success("Signup successful");
      navigate("/");
    } catch (error) {
      toast.error("Signup failed, please check the credentials");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-12 rounded-lg shadow-lg w-[450px] space-y-6"
      >
        <div className="flex justify-center">
          <img
            src="https://thaalam.ch/newfile/subscription/assets/img/thalam-logo.png"
            alt="Thaalam Logo"
            className="w-36 h-36 object-contain mb-2"
          />
        </div>
        <h2 className="text-3xl font-medium text-center text-red-600">
          Signup
        </h2>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
              errors.email ? "focus:ring-red-500" : "focus:ring-orange-500"
            }`}
          />
          <label
            htmlFor="email"
            className={`absolute left-3 top-4 text-md transition-all ${
              errors.email ? "text-red-500" : "text-gray-500"
            } peer-focus:top-1 peer-focus:text-xs peer-focus:${
              errors.email ? "text-red-500" : "text-gray-500"
            } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
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
              errors.password ? "focus:ring-red-500" : "focus:ring-orange-500"
            }`}
          />
          <label
            htmlFor="password"
            className={`absolute left-3 top-4 text-md transition-all ${
              errors.password ? "text-red-500" : "text-gray-500"
            } peer-focus:top-1 peer-focus:text-xs peer-focus:${
              errors.password ? "text-red-500" : "text-gray-500"
            } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
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

        {/* Confirm Password Field */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder=" "
            className={`peer w-full border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } p-3 pt-5 rounded focus:outline-none focus:ring-1 ${
              errors.confirmPassword
                ? "focus:ring-red-500"
                : "focus:ring-orange-500"
            }`}
          />
          <label
            htmlFor="confirmPassword"
            className={`absolute left-3 top-4 text-md transition-all ${
              errors.confirmPassword ? "text-red-500" : "text-gray-500"
            } peer-focus:top-1 peer-focus:text-xs peer-focus:${
              errors.confirmPassword ? "text-red-500" : "text-gray-500"
            } peer-[&:not(:placeholder-shown)]:top-1 peer-[&:not(:placeholder-shown)]:text-xs`}
          >
            Confirm Password
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-5 focus:outline-none text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Signup
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/" className="text-red-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SignupPage;
