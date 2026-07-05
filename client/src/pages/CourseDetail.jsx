import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourseById } from "../services/courseService";
import { enrollCourse, getMyEnrollments } from "../services/enrollmentService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";
import Footer from "../components/Footer";

const LEVEL_BG = { Beginner: "#dcfce7", Intermediate: "#fef9c3", Advanced: "#fee2e2" };
const LEVEL_FG = { Beginner: "#166534", Intermediate: "#854d0e", Advanced: "#991b1b" };

export default function CourseDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course,    setCourse]    = useState(null);
  const [enrolled,  setEnrolled]  = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { course } = await getCourseById(id);
        setCourse(course);
        if (user) {
          const { enrollments } = await getMyEnrollments();
          setEnrolled(enrollments.some(e => e.course._id === id));
        }
      } catch { setError("Failed to load course."); }
      finally  { setLoading(false); }
    })();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    setEnrolling(true); setError("");
    try {
      await enrollCourse(id);
      setEnrolled(true);
      setSuccess("Enrolled! Start learning now. 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed.");
    } finally { setEnrolling(false); }
  };

  if (loading) return <div className="container mt-5"><Spinner /></div>;
  if (!course)  return <div className="container mt-5"><AlertMsg msg={error || "Course not found."} /></div>;

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>
      {/* Hero */}
      <div style={{ background: "#0f172a" }}>
        <div className="container-xl py-5">
          <div className="row g-5 align-items-start">
            <div className="col-lg-8">
              <div className="d-flex gap-2 flex-wrap mb-3">
                <span className="rounded-pill px-3 py-1 fw-semibold"
                  style={{ background: "rgba(245,158,11,.15)", color: "#f59e0b", fontSize: ".78rem", border: "1px solid rgba(245,158,11,.3)" }}>
                  {course.category}
                </span>
                {course.level && (
                  <span className="rounded-pill px-3 py-1 fw-semibold"
                    style={{ background: `${LEVEL_BG[course.level]}22`, color: LEVEL_BG[course.level], fontSize: ".78rem" }}>
                    {course.level}
                  </span>
                )}
                {course.duration && (
                  <span className="rounded-pill px-3 py-1"
                    style={{ background: "#1e293b", color: "#94a3b8", fontSize: ".78rem" }}>
                    ⏱ {course.duration}
                  </span>
                )}
              </div>

              <h1 className="fw-black text-white mb-3" style={{ lineHeight: 1.15 }}>{course.title}</h1>
              <p style={{ color: "#94a3b8", lineHeight: 1.7, maxWidth: 640 }}>{course.description}</p>

              {course.instructor?.name && (
                <p style={{ color: "#64748b", fontSize: ".88rem" }}>👤 Instructor: <span style={{ color: "#e2e8f0" }}>{course.instructor.name}</span></p>
              )}

              <div className="d-flex gap-4 mt-3" style={{ color: "#64748b", fontSize: ".85rem" }}>
                <span>📚 {course.lessons?.length || 0} lessons</span>
                <span>👥 {course.enrollCount || 0} enrolled</span>
              </div>
            </div>

            {/* Enroll card */}
            <div className="col-lg-4">
              <div className="rounded-3 overflow-hidden" style={{ background: "#1e293b", border: "2px solid #334155" }}>
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title}
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                    onError={e => e.target.style.display="none"} />
                )}
                <div className="p-4">
                  <div className="fw-black mb-1" style={{ color: "#22c55e", fontSize: "1.5rem" }}>Free</div>
                  <p style={{ color: "#64748b", fontSize: ".82rem", marginBottom: 16 }}>Full lifetime access · Certificate included</p>

                  <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
                  <AlertMsg msg={error} onClose={() => setError("")} />

                  {enrolled ? (
                    <Link to={`/lessons/${id}`} className="btn fw-bold w-100 mb-2"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none", padding: "10px" }}>
                      ▶ Continue Learning
                    </Link>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling} className="btn fw-bold w-100 mb-2"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none", padding: "10px" }}>
                      {enrolling ? <><span className="spinner-border spinner-border-sm me-2" />Enrolling…</> : "Enroll Now — Free"}
                    </button>
                  )}

                  <ul className="list-unstyled mt-3 mb-0" style={{ color: "#94a3b8", fontSize: ".82rem" }}>
                    {["Progress tracking","Video lessons","Final quiz","Downloadable certificate"].map(t => (
                      <li key={t} className="mb-1">
                        <span style={{ color: "#22c55e" }}>✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      {course.lessons?.length > 0 && (
        <div className="container-xl py-5">
          <h3 className="fw-black mb-4" style={{ color: "#0f172a" }}>
            Course Curriculum <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "1rem" }}>({course.lessons.length} lessons)</span>
          </h3>
          <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            {course.lessons.map((l, i) => (
              <div key={l._id}
                className="d-flex align-items-center gap-3 px-4 py-3"
                style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: i < course.lessons.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <span className="rounded-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{ width: 30, height: 30, background: "#0f172a", color: "#f59e0b", fontSize: ".8rem" }}>
                  {i + 1}
                </span>
                <span style={{ color: "#334155", fontSize: ".9rem" }}>{l.title}</span>
                <span className="ms-auto" style={{ color: "#94a3b8", fontSize: ".8rem" }}>▶</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
