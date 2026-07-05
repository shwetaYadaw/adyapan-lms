import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent }) {
  return (
    <div className="col-sm-6 col-xl-4">
      <div className="rounded-3 p-4 d-flex align-items-center gap-3 h-100"
        style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 48, height: 48, background: `${accent}22`, fontSize: 22 }}>
          {icon}
        </div>
        <div>
          <div className="fw-black lh-1" style={{ fontSize: "2rem", color: accent }}>{value ?? "—"}</div>
          <div className="mt-1" style={{ fontSize: ".8rem", color: "#94a3b8" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getStats()
      .then(({ stats }) => setStats(stats))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-4 py-4"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <div>
            <h3 className="fw-black mb-0" style={{ color: "#ffffff" }}>Dashboard</h3>
            <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".85rem" }}>Platform analytics</p>
          </div>
          <Link to="/admin/courses/add" className="btn fw-bold btn-sm px-4"
            style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
            + Add Course
          </Link>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg msg={error} />

          {loading ? <Spinner /> : stats && (
            <>
              {/* ── Stat cards ────────────────────────────────────── */}
              <div className="row g-3 mb-5">
                <StatCard icon="👥" label="Total Students"      value={stats.totalStudents}        accent="#60a5fa" />
                <StatCard icon="📚" label="Total Courses"       value={stats.totalCourses}         accent="#4ade80" />
                <StatCard icon="📋" label="Total Enrollments"   value={stats.totalEnrollments}     accent="#f59e0b" />
                <StatCard icon="🏆" label="Certificates Issued" value={stats.totalCertificates}    accent="#fcd34d" />
                <StatCard icon="✅" label="Completions"         value={stats.completedEnrollments} accent="#4ade80" />
                <StatCard icon="🆕" label="New (7 days)"        value={stats.recentSignups ?? 0}   accent="#c084fc" />
              </div>

              <div className="row g-4">
                {/* ── Popular courses ────────────────────────────── */}
                <div className="col-lg-6">
                  <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                    <div className="px-4 py-3 fw-bold"
                      style={{ background: "#1e293b", color: "#f59e0b", fontSize: ".95rem" }}>
                      🔥 Most Popular Courses
                    </div>

                    {stats.popularCourses.length === 0 ? (
                      <div className="px-4 py-4" style={{ color: "#64748b" }}>
                        No enrollment data yet.
                      </div>
                    ) : stats.popularCourses.map((c, i) => (
                      <div key={c._id}
                        className="d-flex align-items-center justify-content-between px-4 py-3"
                        style={{ borderTop: "1px solid #1e293b" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1a2234"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="rounded-2 fw-black d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 28, height: 28, background: "#f59e0b", color: "#0f172a", fontSize: ".8rem" }}>
                            {i + 1}
                          </span>
                          <span style={{ color: "#e2e8f0", fontSize: ".88rem" }}>{c.title}</span>
                        </div>
                        <span className="rounded-pill px-2 py-1 fw-semibold"
                          style={{ background: "rgba(96,165,250,.15)", color: "#93c5fd", fontSize: ".75rem" }}>
                          {c.count} enrolled
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Recent students ────────────────────────────── */}
                <div className="col-lg-6">
                  <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                    <div className="px-4 py-3 d-flex justify-content-between align-items-center"
                      style={{ background: "#1e293b" }}>
                      <span className="fw-bold" style={{ color: "#f59e0b", fontSize: ".95rem" }}>
                        🆕 Recent Students
                      </span>
                      <Link to="/admin/users" className="small fw-semibold text-decoration-none"
                        style={{ color: "#64748b" }}>
                        View all →
                      </Link>
                    </div>

                    {stats.recentUsers.length === 0 ? (
                      <div className="px-4 py-4" style={{ color: "#64748b" }}>
                        No students yet.
                      </div>
                    ) : stats.recentUsers.map((u) => (
                      <div key={u._id}
                        className="d-flex align-items-center justify-content-between px-4 py-3"
                        style={{ borderTop: "1px solid #1e293b" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1a2234"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle fw-black d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 34, height: 34, background: "#f59e0b", color: "#0f172a", fontSize: 14 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ color: "#e2e8f0", fontSize: ".88rem", fontWeight: 600 }}>
                              {u.name}
                            </div>
                            <div style={{ color: "#64748b", fontSize: ".75rem" }}>{u.email}</div>
                          </div>
                        </div>
                        <div style={{ color: "#475569", fontSize: ".76rem", whiteSpace: "nowrap" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
