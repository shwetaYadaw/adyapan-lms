import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = user?.role === "admin" ? "/admin" : user ? "/dashboard" : "/";

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center px-4 fade-in"
      style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>

      {/* Big 404 */}
      <div className="fw-black lh-1 mb-2"
        style={{ fontSize: "clamp(6rem,20vw,10rem)", color: "#1e293b", letterSpacing: "-.04em" }}>
        404
      </div>

      <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>

      <h2 className="fw-black text-white mb-2">Page Not Found</h2>
      <p style={{ color: "#64748b", maxWidth: 400, marginBottom: 32 }}>
        The page you're looking for doesn't exist or has been moved.
        Double-check the URL or go back to safety.
      </p>

      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <button onClick={() => navigate(-1)} className="btn fw-semibold px-4"
          style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
          ← Go Back
        </button>
        <Link to={home} className="btn fw-bold px-5"
          style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
