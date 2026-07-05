import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../services/courseService";
import { enrollCourse, getMyEnrollments } from "../services/enrollmentService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";
import Footer from "../components/Footer";

const CATS   = ["All","Programming","Web Development","Data Science","Design","Business","Mathematics","Science","Other"];
const LEVELS = ["All","Beginner","Intermediate","Advanced"];
const LEVEL_BG = { Beginner: "#dcfce7", Intermediate: "#fef9c3", Advanced: "#fee2e2" };
const LEVEL_FG = { Beginner: "#166534", Intermediate: "#854d0e", Advanced: "#991b1b" };

export default function Courses() {
  const { user } = useAuth();
  const [courses,    setCourses]    = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [enrolled,   setEnrolled]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [enrollMsg,  setEnrollMsg]  = useState({ type: "", text: "", courseId: "" });
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [level,      setLevel]      = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const [cRes, eRes] = await Promise.all([
          getAllCourses(),
          user ? getMyEnrollments() : Promise.resolve({ enrollments: [] }),
        ]);
        setCourses(cRes.courses);
        setFiltered(cRes.courses);
        setEnrolled(eRes.enrollments.map(e => e.course._id));
      } catch { setError("Failed to load courses."); }
      finally  { setLoading(false); }
    })();
  }, [user]);

  useEffect(() => {
    let r = [...courses];
    if (search)           r = r.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") r = r.filter(c => c.category === category);
    if (level    !== "All") r = r.filter(c => c.level    === level);
    setFiltered(r);
  }, [search, category, level, courses]);

  const handleEnroll = async (courseId) => {
    setEnrollMsg({ type: "", text: "", courseId });
    try {
      await enrollCourse(courseId);
      setEnrolled(p => [...p, courseId]);
      setEnrollMsg({ type: "success", text: "Enrolled!", courseId });
      setTimeout(() => setEnrollMsg({ type: "", text: "", courseId: "" }), 2500);
    } catch (err) {
      setEnrollMsg({ type: "danger", text: err.response?.data?.message || "Enrollment failed.", courseId });
    }
  };

  const hasFilters = search || category !== "All" || level !== "All";

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>
      {/* Hero bar */}
      <div style={{ background: "#0f172a", padding: "32px 0 28px" }}>
        <div className="container-xl">
          <h2 className="fw-black text-white mb-1">All Programs</h2>
          <p style={{ color: "#94a3b8", marginBottom: 0 }}>
            {loading ? "Loading…" : `${filtered.length} course${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>
      </div>

      <div className="container-xl py-4 fade-in">
        <AlertMsg msg={error} onClose={() => setError("")} />

        {/* ── Filter bar ─────────────────────────────────────────── */}
        <div className="rounded-3 p-3 mb-4 d-flex flex-wrap gap-2 align-items-end"
          style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <div className="flex-grow-1" style={{ minWidth: 200 }}>
            <input className="form-control" placeholder="🔍  Search courses…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} style={{ minWidth: 160 }}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <select className="form-select" value={level} onChange={e => setLevel(e.target.value)} style={{ minWidth: 130 }}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          {hasFilters && (
            <button className="btn btn-sm btn-outline-secondary"
              onClick={() => { setSearch(""); setCategory("All"); setLevel("All"); }}>
              Clear
            </button>
          )}
        </div>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: 56 }}>📭</div>
            <h5 className="mt-3 text-muted">No courses match your search.</h5>
            {hasFilters && <button className="btn btn-warning fw-bold mt-2" onClick={() => { setSearch(""); setCategory("All"); setLevel("All"); }}>Clear Filters</button>}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {filtered.map(course => (
              <div key={course._id} className="col">
                <div className="h-100 d-flex flex-column rounded-3 overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,.06)", transition: "transform .2s, box-shadow .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.06)"; }}>

                  {/* Thumbnail */}
                  <div style={{ height: 180, overflow: "hidden", background: "#0f172a" }}>
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt={course.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => e.target.style.display="none"} />
                      : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52 }}>📚</div>
                    }
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    {/* Badges */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      <span className="rounded-pill px-2 py-1" style={{ background: "#0f172a18", color: "#0f172a", fontSize: ".7rem", fontWeight: 600 }}>
                        {course.category}
                      </span>
                      {course.level && (
                        <span className="rounded-pill px-2 py-1"
                          style={{ background: LEVEL_BG[course.level] || "#f1f5f9", color: LEVEL_FG[course.level] || "#334155", fontSize: ".7rem", fontWeight: 600 }}>
                          {course.level}
                        </span>
                      )}
                      {course.duration && (
                        <span className="rounded-pill px-2 py-1" style={{ background: "#f1f5f9", color: "#64748b", fontSize: ".7rem" }}>
                          ⏱ {course.duration}
                        </span>
                      )}
                    </div>

                    <h5 className="fw-bold mb-2" style={{ color: "#0f172a" }}>{course.title}</h5>
                    <p className="flex-grow-1 mb-2" style={{ color: "#64748b", fontSize: ".85rem" }}>
                      {course.description?.slice(0, 100)}{course.description?.length > 100 ? "…" : ""}
                    </p>
                    {course.instructor?.name && (
                      <p className="mb-3" style={{ fontSize: ".8rem", color: "#94a3b8" }}>👤 {course.instructor.name}</p>
                    )}

                    {/* Per-card enroll message */}
                    {enrollMsg.courseId === course._id && enrollMsg.text && (
                      <AlertMsg type={enrollMsg.type} msg={enrollMsg.text}
                        onClose={() => setEnrollMsg({ type: "", text: "", courseId: "" })} />
                    )}

                    <div className="d-grid gap-2 mt-auto">
                      <Link to={`/courses/${course._id}`}
                        className="btn btn-sm fw-semibold"
                        style={{ background: "#f8fafc", color: "#0f172a", border: "1px solid #e2e8f0" }}>
                        View Details
                      </Link>
                      {enrolled.includes(course._id)
                        ? <Link to={`/lessons/${course._id}`} className="btn btn-sm fw-bold"
                            style={{ background: "#0f172a", color: "#fff", border: "none" }}>
                            ▶ Continue Learning
                          </Link>
                        : <button className="btn btn-sm fw-bold"
                            style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                            onClick={() => handleEnroll(course._id)} disabled={!user}
                            title={!user ? "Login to enroll" : ""}>
                            {!user ? "Login to Enroll" : "Enroll Free"}
                          </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
