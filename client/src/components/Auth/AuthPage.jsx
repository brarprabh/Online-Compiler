import React, { useState } from "react";
import axios from "axios";
import { Code, User, Mail, Lock } from "lucide-react";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const { data } = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData,
      );
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center text-white font-sans">
      <div className="w-full max-w-md p-8 bg-[#252526] rounded-lg shadow-lg border border-[#3e3e42]">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
            <Code className="text-blue-500 w-8 h-8" />
            <span>
              Code<span className="text-blue-500">Corps</span>
            </span>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#3c3c3c] border border-gray-600 rounded p-2.5 pl-10 focus:border-blue-500 outline-none"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded transition-all"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
