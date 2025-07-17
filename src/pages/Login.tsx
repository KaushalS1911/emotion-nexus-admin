import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/UserContext";
import logo from "../../public/Emotionally Yours Logo.png"

const DUMMY_EMAIL = "admin@gmail.com";
const DUMMY_PASSWORD = "admin@123";

export default function Login() {
  const { setUser } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("admin-token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      setUser({ id: "1", name: "Admin", email });
      sessionStorage.setItem("admin-token", "1");
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#FF7119]">
        <div className="mb-6 text-center">
          <div className="mx-auto h-[70px] w-[220px] md:w-[210px] lg:w-[250px]">
            <img
                src={logo}
                alt="Emotionally Yours Logo"
                className="h-full w-full object-contain cursor-pointer"
            />
          </div>
          <p className="text-[#012765] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#012765]">Email</label>
            <input
                id="email"
                type="email"
                autoComplete="username"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#FF7119] focus:ring-[#FF7119] text-[#012765]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#012765]">Password</label>
            <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#FF7119] focus:ring-[#FF7119] text-[#012765]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="admin@123"
                required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
              type="submit"
              className="w-full py-2 px-4 bg-[#FF7119] text-white font-semibold rounded hover:bg-[#012765] transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account? <a href="/register" className="text-[#FF7119] hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
} 