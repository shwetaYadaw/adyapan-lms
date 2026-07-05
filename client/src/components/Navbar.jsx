import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const linkCls = ({ isActive }) =>
    `nav-link px-3 py-2 rounded-2 fw-semibold ${isActive ? "text-warning" : "text-white-50"}`;

  return (
    <nav className="navbar navbar-expand-lg sticky-top"
      style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
      <div className="container-xl">

        {/* Brand */}
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span
            className="rounded-2 d-flex align-items-center justify-content-center fw-black"
            style={{ width: 34, height: 34, background: "#f59e0b", color: "#0f172a", fontSize: 16 }}
          >ady.</span>
          <span className="fw-bold text-white fs-5">Adyapan</span>
        </NavLink>

        {/* Mobile toggle */}
        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#navMain" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          {/* Centre links */}
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item"><NavLink className={linkCls} to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className={linkCls} to="/courses">All Programs</NavLink></li>
            {user && <>
              <li className="nav-item"><NavLink className={linkCls} to="/my-courses">My Courses</NavLink></li>
              <li className="nav-item"><NavLink className={linkCls} to="/certificates">Get Certification</NavLink></li>
              <li className="nav-item"><NavLink className={linkCls} to="/dashboard">Dashboard</NavLink></li>
            </>}
          </ul>

          {/* Right actions */}
          <ul className="navbar-nav align-items-lg-center gap-2">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="btn btn-outline-light btn-sm px-4">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="btn btn-warning btn-sm px-4 fw-bold">Sign Up</NavLink>
                </li>
              </>
            ) : (
              <>
                {user.role === "admin" && (
                  <li className="nav-item">
                    <NavLink to="/admin" className="btn btn-sm px-3"
                      style={{ background: "#1e3a5f", color: "#f59e0b", border: "1px solid #f59e0b" }}>
                      ⚙ Admin
                    </NavLink>
                  </li>
                )}
                {/* Avatar dropdown */}
                <li className="nav-item dropdown">
                  <button className="btn btn-sm dropdown-toggle d-flex align-items-center gap-2"
                    style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" }}
                    data-bs-toggle="dropdown">
                    <span className="rounded-circle bg-warning text-dark d-inline-flex align-items-center
                      justify-content-center fw-bold"
                      style={{ width: 26, height: 26, fontSize: 12 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                    {user.name?.split(" ")[0]}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}>
                    <li>
                      <span className="dropdown-item-text small" style={{ color: "#64748b" }}>
                        {user.email}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" style={{ borderColor: "#334155" }} /></li>
                    {[
                      { to: "/profile",      label: "👤 My Profile" },
                      { to: "/my-courses",   label: "📚 My Courses" },
                      { to: "/certificates", label: "🏆 Certificates" },
                    ].map(({ to, label }) => (
                      <li key={to}>
                        <NavLink className="dropdown-item" to={to}
                          style={{ color: "#e2e8f0" }}
                          onMouseEnter={e => e.target.style.background = "#334155"}
                          onMouseLeave={e => e.target.style.background = "transparent"}>
                          {label}
                        </NavLink>
                      </li>
                    ))}
                    <li><hr className="dropdown-divider" style={{ borderColor: "#334155" }} /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}
                        style={{ background: "transparent" }}>
                        🚪 Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
