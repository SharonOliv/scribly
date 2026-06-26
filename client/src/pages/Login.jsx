import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const response = await api.post(endpoint, formData);

      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-ink">Scribly</h1>
          <p className="text-ink-soft text-sm mt-1">Write. Share. Keep it together.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-line rounded-lg p-6 shadow-sm space-y-4"
        >
          <h2 className="font-display text-xl text-ink">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm text-ink-soft mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-line rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-ink-soft mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={mode === "register" ? 6 : undefined}
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-line rounded px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white rounded py-2 font-medium hover:bg-accent/90 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>

          <p className="text-sm text-ink-soft text-center">
            {mode === "login" ? "New to Scribly?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-accent font-medium hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
