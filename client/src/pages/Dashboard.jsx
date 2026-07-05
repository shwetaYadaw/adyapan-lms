import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyEnrollments } from "../services/enrollmentService";
import { getMyCertificates } from "../services/certificateService";
import { generateCertificate, downloadCertificate } from "../services/certificateService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, accent, to }) {
  const inner = (
    <div
      className="rounded-3 p-4 h-100 d-flex align-items-center gap-3"
      style={{
        background:  "#fff",
        border:      "1px solid #e2e8f0",
        boxShadow:   "0 2px 12px rgba(0,0,0,.05)",
        transition:  "transform .2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <div
        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 52, height: 52, background: `${accent}18`, fontSize: 24 }}
      >
        {icon}
      </div>
      <div>
        <div className="fw-black lh-1" style={{ fontSize: "2rem", color: "#0f172a" }}>
          {value}
        </div>
        <div className="mt-1" style={{ fontSize: ".8rem", color: "#64748b" }}>{label}</div>
      </div>
    </div>
  );
  return (
    <div className="col-sm-6 col-xl-3">
      {to ? <Link to={to} className="text-decoration-none d-block h-100">{inner}</Link> : inner}
    </div>
  );
}

export default function Dashboard() {
  const { user }                       = useAuth();
  const [enrollments, setEnrollments]  = useState([]);
  const [certs,       setCerts]        = useState([]);
  const [loading,     setLoading]      = useState(true);
  const [certMsg,     setCertMsg]      = useState({ type: "", text: "" });
  const [generating,  setGenerating]   = useState(null);

  useEffect(() => {
    Promise.all([getMyEnrollments(), getMyCertificates()])
      .then(([e, c]) => {
        setEnrollments((e.enrollments || []).filter((x) => x.course));
        setCerts(c.certificates || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const inProgress  = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed   = enrollments.filter((e) => e.progress === 100);
  const notStarted  = enrollments.filter((e) => e.progress === 0);
  const active      = [...inProgress, ...notStarted];

  /* ── Generate + download certificate directly from dashboard ─────── */
  const handleGetCert = async (courseId, courseName) => {
    setGenerating(courseId);
    setCertMsg({ type: "", text: "" });
    try {
      const data = await generateCertificate(courseId);
      if (data.certificate?.certificateId) {
        await downloadCertificate(
          data.certificate.certificateId,
          `Adyapan-${user?.name?.replace(/\s+/g, "-")}-${courseName?.replace(/\s+/g, "-")}.pdf`
        );
        setCertMsg({
          type: "success",
          text: `🎉 Certificate for "${user?.name}" downloaded!`,
        });
        // Refresh certs list
        getMyCertificates()
          .then(({ certificates }) => setCerts(certificates))
          .catch(() => {});
      }
    } catch (err) {
      setCertMsg({
        type: "danger",
        text: err.response?.data?.message || "Certificate generation failed.",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: "#0f172a", padding: "28px 0" }}>
        <div className="container-xl">
          <h2 className="fw-black text-white mb-1">
            Welcome back,{" "}
            <span style={{ color: "#f59e0b" }}>{user?.name?.split(" ")[0]}</span> 👋
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 0, fontSize: ".88rem" }}>
            Here's your learning overview for today.
          </p>
        </div>
      </div>

      <div className="container-xl py-5">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* ── Stat cards ───────────────────────────────────────── */}
            <div className="row g-3 mb-5">
              <StatCard icon="📚" label="Enrolled Courses"   value={enrollments.length} accent="#3b82f6" to="/my-courses" />
              <StatCard icon="⚡" label="In Progress"        value={inProgress.length}  accent="#f59e0b" to="/my-courses" />
              <StatCard icon="✅" label="Completed"          value={completed.length}   accent="#22c55e" to="/my-courses" />
              <StatCard icon="🏆" label="Certificates Earned" value={certs.length}      accent="#f59e0b" to="/certificates" />
            </div>

            {/* Cert alert */}
            {certMsg.text && (
              <div className="mb-4">
                <AlertMsg
                  type={certMsg.type}
                  msg={certMsg.text}
                  onClose={() => setCertMsg({ type: "", text: "" })}
                />
              </div>
            )}

            <div className="row g-4">
              {/* ── Continue / Start Learning ─────────────────────── */}
              <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
                    {inProgress.length > 0 ? "Continue Learning" : "Your Courses"}
                  </h5>
                  <Link
                    to="/my-courses"
                    className="small fw-semibold text-decoration-none"
                    style={{ color: "#f59e0b" }}
                  >
                    View all →
                  </Link>
                </div>

                {active.length === 0 && completed.length === 0 ? (
                  <div
                    className="text-center py-5 rounded-3"
                    style={{ background: "#fff", border: "1px solid #e2e8f0" }}
                  >
                    <div style={{ fontSize: 52 }}>📖</div>
                    <p className="mt-3 mb-3 text-muted">No courses enrolled yet.</p>
                    <Link
                      to="/courses"
                      className="btn fw-bold px-4"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {/* In-progress & not started */}
                    {active.slice(0, 3).map((e) => (
                      <div
                        key={e._id}
                        className="rounded-3 p-3 d-flex align-items-center gap-3"
                        style={{
                          background: "#fff",
                          border:     "1px solid #e2e8f0",
                          boxShadow:  "0 2px 8px rgba(0,0,0,.04)",
                        }}
                      >
                        <div
                          className="flex-shrink-0 rounded-2 overflow-hidden"
                          style={{ width: 60, height: 60, background: "#0f172a" }}
                        >
                          {e.course.thumbnail ? (
                            <img
                              src={e.course.thumbnail}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(ev) => (ev.target.style.display = "none")}
                            />
                          ) : (
                            <span
                              style={{
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                height:         "100%",
                                fontSize:       24,
                              }}
                            >📚</span>
                          )}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ color: "#0f172a", fontSize: ".92rem" }}
                          >
                            {e.course.title}
                          </div>
                          <div style={{ fontSize: ".75rem", color: "#64748b" }}>
                            {e.course.category} · {e.course.level}
                          </div>
                          {/* ── Progress bar (visible on white bg) ── */}
                          <div
                            className="mt-2"
                            style={{ background: "#cbd5e1", borderRadius: 99, height: 8, border: "1px solid #94a3b8", overflow: "hidden" }}
                          >
                            <div
                              style={{
                                width:        `${e.progress}%`,
                                height:       "100%",
                                background:   e.progress === 100
                                                ? "linear-gradient(90deg,#16a34a,#22c55e)"
                                                : "linear-gradient(90deg,#d97706,#f59e0b)",
                                borderRadius: 99,
                                transition:   "width .5s",
                                minWidth:     e.progress > 0 ? 8 : 0,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: ".72rem", color: "#94a3b8", marginTop: 3 }}>
                            {e.progress}% complete
                          </div>
                        </div>
                        <Link
                          to={`/lessons/${e.course._id}`}
                          className="btn btn-sm fw-semibold flex-shrink-0"
                          style={{
                            background: "#0f172a",
                            color:      "#fff",
                            border:     "none",
                            fontSize:   ".8rem",
                          }}
                        >
                          {e.progress === 0 ? "Start" : "Resume"}
                        </Link>
                      </div>
                    ))}

                    {/* Completed courses with certificate button */}
                    {completed.slice(0, 2).map((e) => (
                      <div
                        key={e._id}
                        className="rounded-3 p-3 d-flex align-items-center gap-3"
                        style={{
                          background: "#fff",
                          border:     "2px solid #22c55e",
                          boxShadow:  "0 2px 8px rgba(34,197,94,.08)",
                        }}
                      >
                        <div
                          className="flex-shrink-0 rounded-2 overflow-hidden"
                          style={{ width: 60, height: 60, background: "#0f172a" }}
                        >
                          {e.course.thumbnail ? (
                            <img
                              src={e.course.thumbnail}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(ev) => (ev.target.style.display = "none")}
                            />
                          ) : (
                            <span
                              style={{
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                height:         "100%",
                                fontSize:       24,
                              }}
                            >📚</span>
                          )}
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ color: "#0f172a", fontSize: ".92rem" }}
                          >
                            {e.course.title}
                          </div>
                          <div style={{ fontSize: ".75rem", color: "#22c55e", fontWeight: 600 }}>
                            ✓ Completed · 100%
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap flex-shrink-0">
                          <button
                            className="btn btn-sm fw-bold"
                            style={{ background: "#f59e0b", color: "#0f172a", border: "none", fontSize: ".78rem" }}
                            onClick={() => handleGetCert(e.course._id, e.course.title)}
                            disabled={generating === e.course._id}
                          >
                            {generating === e.course._id
                              ? <span className="spinner-border spinner-border-sm" />
                              : "🏆 Certificate"
                            }
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Certificates panel ───────────────────────────────── */}
              <div className="col-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Certificates</h5>
                  {certs.length > 0 && (
                    <Link
                      to="/certificates"
                      className="small fw-semibold text-decoration-none"
                      style={{ color: "#f59e0b" }}
                    >
                      View all →
                    </Link>
                  )}
                </div>

                {certs.length === 0 ? (
                  <div
                    className="text-center py-4 rounded-3"
                    style={{ background: "#fff", border: "1px solid #e2e8f0" }}
                  >
                    <div style={{ fontSize: 44 }}>🏆</div>
                    <p className="mt-2 mb-3 small text-muted">
                      Complete a course to earn your first certificate.
                    </p>
                    {completed.length > 0 && (
                      <Link
                        to="/my-courses"
                        className="btn btn-sm fw-bold"
                        style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                      >
                        Get Certificate
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {certs.slice(0, 3).map((c) => (
                      <div
                        key={c._id}
                        className="rounded-3 p-3 d-flex align-items-center gap-3"
                        style={{
                          background: "#0f172a",
                          border:     "2px solid #f59e0b",
                          boxShadow:  "0 4px 14px rgba(245,158,11,.12)",
                        }}
                      >
                        <div style={{ fontSize: 28, flexShrink: 0 }}>🏆</div>
                        <div className="flex-grow-1 min-w-0">
                          <div
                            className="fw-semibold text-truncate"
                            style={{ color: "#fff", fontSize: ".88rem" }}
                          >
                            {c.course?.title}
                          </div>
                          <div style={{ fontSize: ".72rem", color: "#64748b" }}>
                            {new Date(c.issuedDate).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          <div style={{ fontSize: ".7rem", color: "#f59e0b", fontWeight: 600 }}>
                            Issued to: {user?.name}
                          </div>
                        </div>
                        <Link
                          to="/certificates"
                          className="btn btn-sm fw-bold flex-shrink-0"
                          style={{
                            background: "#f59e0b",
                            color:      "#0f172a",
                            border:     "none",
                            fontSize:   ".75rem",
                          }}
                        >
                          ⬇
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
