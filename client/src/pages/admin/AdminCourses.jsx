import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminCourses, deleteCourse } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

const LEVEL_BG = { Beginner: "#dcfce7", Intermediate: "#fef9c3", Advanced: "#fee2e2" };
const LEVEL_FG = { Beginner: "#166534", Intermediate: "#854d0e", Advanced: "#991b1b" };

const td = { padding: "13px 16px", verticalAlign: "middle" };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  const fetchCourses = () => {
    setLoading(true);
    getAdminCourses()
      .then(({ courses }) => setCourses(courses))
      .catch(() => setError("Failed to load courses."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?\nThis removes all lessons, enrollments and progress.`)) return;
    try { await deleteCourse(id); fetchCourses(); }
    catch { setError("Failed to delete course."); }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-4 py-4"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <div>
            <h3 className="fw-black mb-0" style={{ color: "#ffffff" }}>Manage Courses</h3>
            <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".85rem" }}>
              {courses.length} courses total
            </p>
          </div>
          <Link to="/admin/courses/add" className="btn fw-bold btn-sm px-4"
            style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
            + Add Course
          </Link>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg msg={error} onClose={() => setError("")} />

          {/* Search */}
          <div className="mb-4">
            <input className="form-control" placeholder="🔍  Search courses…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                maxWidth: 380,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#e2e8f0",
                borderRadius: 8,
              }} />
          </div>

          {loading ? <Spinner /> : (
            <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #1e293b" }}>
              <table className="table mb-0" style={{ background: "transparent", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    {["#", "Course", "Category", "Level", "Lessons", "Enrolled", "Actions"].map(h => (
                      <th key={h} style={{
                        color: "#94a3b8", fontWeight: 600, fontSize: ".8rem",
                        padding: "13px 16px", borderBottom: "none",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ ...td, textAlign: "center", color: "#64748b", padding: "40px" }}>
                        No courses found.
                      </td>
                    </tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c._id}
                      style={{ borderTop: "1px solid #1e293b" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2234"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* # */}
                      <td style={{ ...td, color: "#64748b", fontSize: ".8rem" }}>{i + 1}</td>

                      {/* Title */}
                      <td style={td}>
                        <div className="fw-semibold" style={{ color: "#e2e8f0", fontSize: ".9rem" }}>
                          {c.title}
                        </div>
                        <div style={{ color: "#64748b", fontSize: ".76rem" }}>
                          {c.instructor?.name || "—"}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={td}>
                        <span className="rounded-pill px-2 py-1 fw-semibold"
                          style={{ background: "rgba(245,158,11,.12)", color: "#f59e0b", fontSize: ".72rem" }}>
                          {c.category}
                        </span>
                      </td>

                      {/* Level */}
                      <td style={td}>
                        <span className="rounded-pill px-2 py-1 fw-semibold"
                          style={{
                            background: LEVEL_BG[c.level] || "#f1f5f9",
                            color:      LEVEL_FG[c.level] || "#334155",
                            fontSize:   ".72rem",
                          }}>
                          {c.level}
                        </span>
                      </td>

                      {/* Lessons */}
                      <td style={{ ...td, color: "#94a3b8", fontSize: ".88rem" }}>
                        {c.lessons?.length ?? 0}
                      </td>

                      {/* Enrolled */}
                      <td style={td}>
                        <span className="rounded-pill px-2 py-1 fw-semibold"
                          style={{ background: "rgba(59,130,246,.12)", color: "#60a5fa", fontSize: ".72rem" }}>
                          {c.enrollCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={td}>
                        <div className="d-flex gap-1 flex-wrap">
                          <Link to={`/admin/courses/edit/${c._id}`}
                            className="btn btn-sm fw-semibold"
                            style={{ background: "#1e3a5f", color: "#93c5fd", border: "1px solid rgba(147,197,253,.25)", fontSize: ".74rem" }}>
                            Edit
                          </Link>
                          <Link to={`/admin/courses/${c._id}/lessons/add`}
                            className="btn btn-sm fw-semibold"
                            style={{ background: "#14532d44", color: "#4ade80", border: "1px solid rgba(74,222,128,.25)", fontSize: ".74rem" }}>
                            + Lesson
                          </Link>
                          <Link to={`/admin/courses/${c._id}/quiz`}
                            className="btn btn-sm fw-semibold"
                            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", fontSize: ".74rem" }}>
                            Quiz
                          </Link>
                          <button
                            className="btn btn-sm fw-semibold"
                            style={{ background: "#4c0519", color: "#fca5a5", border: "1px solid rgba(252,165,165,.25)", fontSize: ".74rem" }}
                            onClick={() => handleDelete(c._id, c.title)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
