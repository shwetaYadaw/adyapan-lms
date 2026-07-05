import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import AlertMsg from "../components/AlertMsg";

export default function Register() {
  const navigate        = useNavigate();
  const { user, login } = useAuth();

  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(form);
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#e2e8f0",
    borderRadius: 8,
  };
  const labelStyle = { color: "#94a3b8", fontSize: ".82rem", fontWeight: 600 };

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
          <h2 className="fw-black text-white mb-1">Create account</h2>
          <p style={{ color: "#64748b" }}>Join Adyapan and start learning for free</p>
        </div>

        {/* Card */}
        <div className="rounded-3 p-4 p-md-5"
          style={{ background: "#1e293b", border: "1px solid #334155" }}>

          <AlertMsg msg={error} onClose={() => setError("")} />

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="mb-3">
              <label className="form-label" style={labelStyle} htmlFor="name">Full Name</label>
              <input
                id="name" type="text" name="name"
                className="form-control"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                autoComplete="name" required
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label" style={labelStyle} htmlFor="email">Email address</label>
              <input
                id="email" type="email" name="email"
                className="form-control"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                autoComplete="email" required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label" style={labelStyle} htmlFor="password">Password</label>
              <div className="input-group">
                <input
                  id="password" name="password"
                  type={showPw ? "text" : "password"}
                  className="form-control"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required minLength={6}
                  style={{ ...inputStyle, borderRadius: "8px 0 0 8px" }}
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
              <div style={{ color: "#475569", fontSize: ".75rem", marginTop: 4 }}>
                Minimum 6 characters.
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn fw-bold w-100 py-2"
              style={{ background: "#f59e0b", color: "#0f172a", border: "none",
                       borderRadius: 8, fontSize: "1rem" }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Creating…</>
                : "Create Account"
              }
            </button>
          </form>
        </div>

        <p className="text-center mt-4" style={{ color: "#64748b", fontSize: ".88rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#f59e0b", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
