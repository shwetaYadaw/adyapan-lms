import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import AlertMsg from "../components/AlertMsg";

export default function Login() {
  const navigate        = useNavigate();
  const { user, login } = useAuth();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  // Already logged-in? redirect immediately
  useEffect(() => {
    if (user) navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(form);
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3 fade-in"
      style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div className="text-center mb-4">
          <div
            className="rounded-3 d-inline-flex align-items-center justify-content-center fw-black mb-3"
            style={{ width: 56, height: 56, background: "#f59e0b", color: "#0f172a", fontSize: 24 }}
          >
            ady.
          </div>
          <h2 className="fw-black text-white mb-1">Welcome back</h2>
          <p style={{ color: "#64748b" }}>Sign in to your Adyapan account</p>
        </div>

        {/* Card */}
        <div className="rounded-3 p-4 p-md-5"
          style={{ background: "#1e293b", border: "1px solid #334155" }}>

          <AlertMsg msg={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="email"
                style={{ color: "#94a3b8", fontSize: ".82rem" }}>
                Email address
              </label>
              <input
                id="email" type="email" name="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email" required
                style={{ background: "#0f172a", border: "1px solid #334155",
                         color: "#e2e8f0", borderRadius: 8 }}
              />
            </div>

            {/* Password */}
            <div className="mb-1">
              <label className="form-label fw-semibold" htmlFor="password"
                style={{ color: "#94a3b8", fontSize: ".82rem" }}>
                Password
              </label>
              <div className="input-group">
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"}
                  className="form-control"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password" required
                  style={{ background: "#0f172a", border: "1px solid #334155",
                           color: "#e2e8f0", borderRadius: "8px 0 0 8px" }}
                />
                <button type="button" tabIndex={-1}
                  className="btn"
                  style={{ background: "#0f172a", border: "1px solid #334155",
                           borderLeft: "none", color: "#64748b", borderRadius: "0 8px 8px 0" }}
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <small style={{ color: "#475569", fontSize: ".78rem" }}>
                Forgot password? Contact admin.
              </small>
            </div>

            <button type="submit" disabled={loading}
              className="btn fw-bold w-100 py-2"
              style={{ background: "#f59e0b", color: "#0f172a", border: "none",
                       borderRadius: 8, fontSize: "1rem" }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                : "Sign In"
              }
            </button>
          </form>
        </div>

        <p className="text-center mt-4" style={{ color: "#64748b", fontSize: ".88rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#f59e0b", fontWeight: 700, textDecoration: "none" }}>
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
