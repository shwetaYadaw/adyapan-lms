import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin",              icon: "📊", label: "Dashboard",    end: true },
  { to: "/admin/courses",      icon: "📚", label: "Courses" },
  { to: "/admin/courses/add",  icon: "➕", label: "Add Course" },
  { to: "/admin/users",        icon: "👥", label: "Students" },
  { to: "/admin/certificates", icon: "🏆", label: "Certificates" },
];

export default function AdminSidebar() {
  return (
    <aside
      className="d-flex flex-column p-3 flex-shrink-0"
      style={{
        minWidth: 220,
        background: "#0b1120",
        borderRight: "1px solid #1e293b",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <p
        className="text-uppercase fw-bold mb-3 ps-2 mb-2"
        style={{ fontSize: ".65rem", letterSpacing: ".14em", color: "#334155" }}
      >
        Admin Panel
      </p>

      <nav className="d-flex flex-column gap-1">
        {links.map(({ to, icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display:        "flex",
              alignItems:     "center",
              gap:            10,
              padding:        "9px 14px",
              borderRadius:   8,
              textDecoration: "none",
              fontSize:       ".88rem",
              fontWeight:     isActive ? 700 : 500,
              color:          isActive ? "#f59e0b" : "#64748b",
              background:     isActive ? "rgba(245,158,11,.1)" : "transparent",
              borderLeft:     isActive ? "3px solid #f59e0b" : "3px solid transparent",
              transition:     "all .15s",
            })}
          >
            <span style={{ fontSize: "1rem" }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
