import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "#0b1120", borderTop: "1px solid #1e293b", marginTop: "auto" }}>
      <div className="container-xl py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-2 d-flex align-items-center justify-content-center fw-black"
                style={{ width: 34, height: 34, background: "#f59e0b", color: "#0f172a", fontSize: 14 }}>
                ady.
              </div>
              <span className="fw-black fs-5 text-white">Adyapan</span>
            </div>
            <p style={{ color: "#64748b", fontSize: ".88rem", lineHeight: 1.7, maxWidth: 300 }}>
              India's free learning platform. Enroll in expert-led courses,
              track progress, pass quizzes and earn verified certificates.
            </p>
          </div>

          {/* Learn */}
          <div className="col-sm-6 col-lg-2">
            <h6 className="fw-bold mb-3" style={{ color: "#94a3b8", fontSize: ".75rem",
                                                   textTransform: "uppercase", letterSpacing: ".1em" }}>
              Learn
            </h6>
            <ul className="list-unstyled mb-0" style={{ fontSize: ".88rem" }}>
              {[
                { to: "/courses",      label: "All Courses" },
                { to: "/courses",      label: "Web Development" },
                { to: "/courses",      label: "Data Science" },
                { to: "/courses",      label: "Programming" },
              ].map(l => (
                <li key={l.label} className="mb-2">
                  <Link to={l.to} style={{ color: "#64748b", textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.color = "#f59e0b"}
                    onMouseLeave={e => e.target.style.color = "#64748b"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="col-sm-6 col-lg-2">
            <h6 className="fw-bold mb-3" style={{ color: "#94a3b8", fontSize: ".75rem",
                                                   textTransform: "uppercase", letterSpacing: ".1em" }}>
              Account
            </h6>
            <ul className="list-unstyled mb-0" style={{ fontSize: ".88rem" }}>
              {[
                { to: "/login",        label: "Sign In" },
                { to: "/register",     label: "Register Free" },
                { to: "/dashboard",    label: "Dashboard" },
                { to: "/certificates", label: "My Certificates" },
              ].map(l => (
                <li key={l.label} className="mb-2">
                  <Link to={l.to} style={{ color: "#64748b", textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.color = "#f59e0b"}
                    onMouseLeave={e => e.target.style.color = "#64748b"}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="col-lg-4">
            <h6 className="fw-bold mb-3" style={{ color: "#94a3b8", fontSize: ".75rem",
                                                   textTransform: "uppercase", letterSpacing: ".1em" }}>
              Platform Stats
            </h6>
            <div className="row g-2">
              {[
                { n: "6+",   l: "Courses" },
                { n: "1K+",  l: "Students" },
                { n: "500+", l: "Certificates" },
                { n: "100%", l: "Free" },
              ].map(s => (
                <div key={s.l} className="col-6">
                  <div className="rounded-2 p-2 text-center"
                    style={{ background: "#1e293b", border: "1px solid #334155" }}>
                    <div className="fw-black" style={{ color: "#f59e0b", fontSize: "1.2rem" }}>{s.n}</div>
                    <div style={{ color: "#475569", fontSize: ".72rem" }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-5 pt-4"
          style={{ borderTop: "1px solid #1e293b" }}>
          <p style={{ color: "#334155", fontSize: ".8rem", margin: 0 }}>
            © {new Date().getFullYear()} Adyapan Learning Platform. All rights reserved.
          </p>
          <p style={{ color: "#334155", fontSize: ".8rem", margin: 0 }}>
            Built with ❤️ for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
