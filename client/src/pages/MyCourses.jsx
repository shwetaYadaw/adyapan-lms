import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments } from "../services/enrollmentService";
import { generateCertificate, downloadCertificate } from "../services/certificateService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

const TABS       = ["All", "In Progress", "Completed"];
const LEVEL_BG   = { Beginner: "#dcfce7", Intermediate: "#fef9c3", Advanced: "#fee2e2" };
const LEVEL_FG   = { Beginner: "#166534", Intermediate: "#854d0e", Advanced: "#991b1b" };

export default function MyCourses() {
  const { user }                          = useAuth();
  const [enrollments, setEnrollments]     = useState([]);
  const [activeTab,   setActiveTab]       = useState("All");
  const [loading,     setLoading]         = useState(true);
  const [generating,  setGenerating]      = useState(null);  // courseId being processed
  const [msg,         setMsg]             = useState({ type: "", text: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { enrollments } = await getMyEnrollments();
      setEnrollments((enrollments || []).filter((e) => e.course));
    } catch {
      setMsg({ type: "danger", text: "Failed to load your courses." });
    } finally {
      setLoading(false);
    }
  };

  /* ── Generate PDF certificate and auto-download ───────────────────── */
  const handleCertificate = async (courseId, courseName) => {
    setGenerating(courseId);
    setMsg({ type: "", text: "" });
    try {
      const data = await generateCertificate(courseId);
      if (data.certificate?.certificateId) {
        // Filename includes student name as on the certificate
        await downloadCertificate(
          data.certificate.certificateId,
          `Adyapan-${user?.name?.replace(/\s+/g, "-")}-${courseName?.replace(/\s+/g, "-")}.pdf`
        );
        setMsg({
          type: "success",
          text: `🎉 Certificate for "${user?.name}" downloaded! Check your Downloads folder.`,
        });
      } else {
        setMsg({ type: "success", text: data.message });
      }
      fetchData();
    } catch (err) {
      setMsg({
        type: "danger",
        text: err.response?.data?.message || "Certificate generation failed.",
      });
    } finally {
      setGenerating(null);
    }
  };

  const tabCount = (tab) => {
    if (tab === "All")         return enrollments.length;
    if (tab === "In Progress") return enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
    return enrollments.filter((e) => e.progress === 100).length;
  };

  const displayed = enrollments.filter((e) => {
    if (activeTab === "In Progress") return e.progress > 0 && e.progress < 100;
    if (activeTab === "Completed")   return e.progress === 100;
    return true;
  });

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>
      {/* ── Top header ─────────────────────────────────────────────── */}
      <div style={{ background: "#0f172a", padding: "28px 0 24px" }}>
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="fw-black text-white mb-0">My Courses</h2>
              <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".85rem" }}>
                {enrollments.length} enrolled
                &nbsp;·&nbsp;
                {enrollments.filter((e) => e.progress === 100).length} completed
              </p>
            </div>
            <Link
              to="/courses"
              className="btn fw-bold"
              style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
            >
              + Enroll More Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="container-xl py-4 fade-in">
        {/* Global alert */}
        {msg.text && (
          <div className="mb-4">
            <AlertMsg
              type={msg.type}
              msg={msg.text}
              onClose={() => setMsg({ type: "", text: "" })}
            />
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div className="d-flex gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn btn-sm fw-semibold px-4"
              style={{
                background:   activeTab === tab ? "#0f172a" : "#fff",
                color:        activeTab === tab ? "#f59e0b" : "#64748b",
                border:       activeTab === tab ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                borderRadius: 8,
              }}
            >
              {tab}
              <span
                className="badge ms-2"
                style={{
                  background: activeTab === tab ? "#f59e0b" : "#e2e8f0",
                  color:      activeTab === tab ? "#0f172a" : "#64748b",
                  fontSize:   ".7rem",
                }}
              >
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Course cards ───────────────────────────────────────── */}
        {loading ? (
          <Spinner />
        ) : displayed.length === 0 ? (
          <div
            className="text-center py-5 rounded-3"
            style={{ background: "#fff", border: "1px solid #e2e8f0" }}
          >
            <div style={{ fontSize: 56 }}>📚</div>
            <h5 className="mt-3 fw-bold" style={{ color: "#0f172a" }}>
              {activeTab === "All"
                ? "No courses enrolled yet"
                : `No ${activeTab.toLowerCase()} courses`}
            </h5>
            {activeTab === "All" && (
              <Link
                to="/courses"
                className="btn fw-bold mt-3 px-5"
                style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {displayed.map((item) => (
              <div key={item._id} className="col">
                <div
                  className="h-100 d-flex flex-column rounded-3 overflow-hidden"
                  style={{
                    background:   "#fff",
                    border:       item.progress === 100
                                    ? "2px solid #22c55e"
                                    : "1px solid #e2e8f0",
                    boxShadow:    "0 2px 12px rgba(0,0,0,.06)",
                    transition:   "transform .2s, box-shadow .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform  = "translateY(-3px)";
                    e.currentTarget.style.boxShadow  = "0 8px 24px rgba(0,0,0,.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform  = "translateY(0)";
                    e.currentTarget.style.boxShadow  = "0 2px 12px rgba(0,0,0,.06)";
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ height: 160, overflow: "hidden", background: "#0f172a", flexShrink: 0 }}>
                    {item.course.thumbnail ? (
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center h-100"
                        style={{ fontSize: 52 }}
                      >
                        📚
                      </div>
                    )}
                  </div>

                  {/* Completed banner */}
                  {item.progress === 100 && (
                    <div
                      className="text-center py-1 fw-bold"
                      style={{
                        background:    "#22c55e",
                        color:         "#fff",
                        fontSize:      ".72rem",
                        letterSpacing: ".08em",
                      }}
                    >
                      ✓ COURSE COMPLETED — {user?.name}
                    </div>
                  )}

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    {/* Badges */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      <span
                        className="rounded-pill px-2 py-1 fw-semibold"
                        style={{
                          background: "rgba(15,23,42,.07)",
                          color:      "#0f172a",
                          fontSize:   ".7rem",
                        }}
                      >
                        {item.course.category}
                      </span>
                      {item.course.level && (
                        <span
                          className="rounded-pill px-2 py-1 fw-semibold"
                          style={{
                            background: LEVEL_BG[item.course.level] || "#f1f5f9",
                            color:      LEVEL_FG[item.course.level] || "#334155",
                            fontSize:   ".7rem",
                          }}
                        >
                          {item.course.level}
                        </span>
                      )}
                    </div>

                    <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>
                      {item.course.title}
                    </h5>

                    {/* ── Progress bar ─────────────────────────────── */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="fw-semibold" style={{ color: "#475569", fontSize: ".8rem" }}>
                          Progress
                        </small>
                        <small
                          className="fw-black"
                          style={{
                            color:    item.progress === 100 ? "#16a34a" : "#d97706",
                            fontSize: ".88rem",
                          }}
                        >
                          {item.progress}%
                        </small>
                      </div>
                      {/* Track — dark enough to contrast with white card */}
                      <div
                        style={{
                          background:   "#cbd5e1",   /* slate-300 — clearly visible on white */
                          borderRadius: 99,
                          height:       10,
                          overflow:     "hidden",
                          border:       "1px solid #94a3b8",
                        }}
                      >
                        {/* Fill */}
                        <div
                          style={{
                            width:        `${item.progress}%`,
                            height:       "100%",
                            background:   item.progress === 100
                                            ? "linear-gradient(90deg,#16a34a,#22c55e)"
                                            : "linear-gradient(90deg,#d97706,#f59e0b)",
                            borderRadius: 99,
                            transition:   "width .6s ease",
                            minWidth:     item.progress > 0 ? 8 : 0,
                          }}
                        />
                      </div>
                      {/* Lesson fraction */}
                      <p style={{ color: "#64748b", fontSize: ".73rem", marginTop: 5, marginBottom: 0 }}>
                        {item.progress === 100
                          ? "✓ All lessons complete"
                          : `${Math.round((item.progress / 100) * (item.course.lessons?.length || 5))} / ${item.course.lessons?.length || 5} lessons done`
                        }
                      </p>
                    </div>

                    {/* ── Action buttons ───────────────────────────── */}
                    <div className="d-grid gap-2 mt-auto">
                      <Link
                        to={`/lessons/${item.course._id}`}
                        className="btn btn-sm fw-bold"
                        style={{ background: "#0f172a", color: "#fff", border: "none" }}
                      >
                        {item.progress === 0
                          ? "▶ Start Course"
                          : item.progress === 100
                            ? "▶ Review Course"
                            : `▶ Continue — ${item.progress}%`
                        }
                      </Link>

                      {item.progress === 100 && (
                        <>
                          <Link
                            to={`/quiz/${item.course._id}`}
                            className="btn btn-sm fw-semibold"
                            style={{
                              background: "#f8fafc",
                              color:      "#0f172a",
                              border:     "1px solid #e2e8f0",
                            }}
                          >
                            📝 Take Quiz
                          </Link>

                          <button
                            className="btn btn-sm fw-bold"
                            style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                            onClick={() => handleCertificate(item.course._id, item.course.title)}
                            disabled={generating === item.course._id}
                          >
                            {generating === item.course._id ? (
                              <><span className="spinner-border spinner-border-sm me-2" />Generating…</>
                            ) : (
                              `🏆 Get Certificate for ${user?.name}`
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
