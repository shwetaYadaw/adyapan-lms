import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLessons } from "../services/lessonService";
import { updateProgress, getProgress } from "../services/progressService";
import { generateCertificate, downloadCertificate } from "../services/certificateService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

/* ── Convert YouTube URL to embed ──────────────────────────────────────────── */
const toEmbed = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
};

export default function Lessons() {
  const { courseId }    = useParams();
  const { user }        = useAuth();

  const [lessons,     setLessons]     = useState([]);
  const [modules,     setModules]     = useState([]);   // grouped by module
  const [completed,   setCompleted]   = useState([]);   // plain string IDs
  const [progress,    setProgress]    = useState(0);
  const [activeId,    setActiveId]    = useState(null); // active lesson _id
  const [loading,     setLoading]     = useState(true);
  const [marking,     setMarking]     = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [msg,         setMsg]         = useState({ type: "", text: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ── Fetch ──────────────────────────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    try {
      const [ld, pd] = await Promise.all([
        getLessons(courseId),
        getProgress(courseId),
      ]);
      setLessons(ld.lessons || []);
      setModules(ld.modules || []);

      if (pd.progress) {
        const ids = (pd.progress.completedLessons || []).map(id =>
          typeof id === "object" ? id.toString() : id
        );
        setCompleted(ids);
        setProgress(pd.progress.percentage || 0);
      }

      // Auto-select first incomplete lesson
      if (!activeId && ld.lessons?.length) {
        const completedIds = (pd.progress?.completedLessons || []).map(id =>
          typeof id === "object" ? id.toString() : id
        );
        const firstIncomplete = ld.lessons.find(l => !completedIds.includes(l._id.toString()));
        setActiveId(firstIncomplete ? firstIncomplete._id : ld.lessons[0]._id);
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to load lessons." });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Mark complete ──────────────────────────────────────────────────────── */
  const handleComplete = async (lessonId) => {
    setMarking(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await updateProgress({ courseId, lessonId, completed: true });
      const idStr = typeof lessonId === "object" ? lessonId.toString() : lessonId;
      setCompleted(prev => prev.includes(idStr) ? prev : [...prev, idStr]);
      const newPct = res.progress?.percentage ?? progress;
      setProgress(newPct);
      setMsg({ type: "success", text: "✅ Lesson completed!" });

      // Auto-advance to next lesson
      const idx = lessons.findIndex(l => l._id.toString() === idStr);
      if (idx < lessons.length - 1) {
        setTimeout(() => setActiveId(lessons[idx + 1]._id), 600);
      }
      if (newPct === 100) await fetchData();
    } catch {
      setMsg({ type: "danger", text: "Failed to update progress." });
    } finally {
      setMarking(false);
    }
  };

  /* ── Get certificate ────────────────────────────────────────────────────── */
  const handleGetCert = async () => {
    setCertLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const data = await generateCertificate(courseId);
      if (data.certificate?.certificateId) {
        await downloadCertificate(
          data.certificate.certificateId,
          `Adyapan-${user?.name?.replace(/\s+/g, "-")}.pdf`
        );
        setMsg({ type: "success", text: `🎉 Certificate for ${user?.name} downloaded!` });
      }
    } catch (err) {
      setMsg({ type: "danger", text: err.response?.data?.message || "Certificate failed." });
    } finally {
      setCertLoading(false);
    }
  };

  const isDone   = id => completed.includes(typeof id === "object" ? id.toString() : id);
  const allDone  = lessons.length > 0 && lessons.every(l => isDone(l._id));
  const activeLesson = lessons.find(l => l._id.toString() === (activeId || "").toString());
  const activeIdx    = lessons.findIndex(l => l._id.toString() === (activeId || "").toString());

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <Spinner />
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     SIDEBAR content — shared between desktop and mobile drawer
  ───────────────────────────────────────────────────────────────────────── */
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-3" style={{ borderBottom: "1px solid #1e293b" }}>
        <Link to={`/courses/${courseId}`}
          style={{ color: "#64748b", textDecoration: "none", fontSize: ".82rem" }}>
          ← Back to Course
        </Link>
        <div className="mt-3">
          <div className="d-flex justify-content-between mb-1">
            <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>Progress</span>
            <span className="fw-black"
              style={{ fontSize: ".82rem", color: progress === 100 ? "#22c55e" : "#f59e0b" }}>
              {progress}%
            </span>
          </div>
          <div style={{ background: "#1e293b", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%", borderRadius: 99,
              background: progress === 100 ? "#22c55e" : "#f59e0b",
              transition: "width .6s ease",
            }} />
          </div>
          <p style={{ color: "#64748b", fontSize: ".7rem", marginTop: 4, marginBottom: 0 }}>
            {completed.length} / {lessons.length} lessons done
          </p>
        </div>
      </div>

      {/* Module + Lesson list */}
      <div className="flex-grow-1 py-2" style={{ overflowY: "auto" }}>
        {modules.length > 0 ? modules.map((mod) => (
          <div key={mod.name}>
            {/* Module header */}
            <div className="px-3 py-2" style={{
              fontSize: ".68rem", color: "#f59e0b", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: ".1em",
              background: "rgba(245,158,11,.06)", borderBottom: "1px solid #1e293b",
            }}>
              📁 {mod.name}
            </div>
            {mod.lessons.map((l) => {
              const done     = isDone(l._id);
              const isActive = l._id.toString() === (activeId || "").toString();
              return (
                <button key={l._id}
                  onClick={() => { setActiveId(l._id); setMobileMenuOpen(false); }}
                  className="d-flex align-items-center gap-2 w-100 text-start"
                  style={{
                    padding: "9px 14px",
                    background: isActive ? "rgba(245,158,11,.1)" : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${isActive ? "#f59e0b" : "transparent"}`,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}>
                  {/* Tick circle */}
                  <span className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: 22, height: 22, borderRadius: "50%", fontSize: ".68rem",
                      background: done ? "#22c55e" : isActive ? "#f59e0b" : "#1e293b",
                      color: done || isActive ? "#0f172a" : "#64748b",
                      border: `2px solid ${done ? "#22c55e" : isActive ? "#f59e0b" : "#334155"}`,
                      flexShrink: 0,
                    }}>
                    {done ? "✓" : l.order}
                  </span>
                  <div className="min-w-0">
                    <span className="text-truncate d-block" style={{
                      fontSize: ".84rem",
                      color: done ? "#4ade80" : isActive ? "#f59e0b" : "#94a3b8",
                      fontWeight: isActive ? 600 : 400,
                      maxWidth: 180,
                    }}>
                      {l.title}
                    </span>
                    {l.duration && (
                      <span style={{ fontSize: ".68rem", color: "#475569" }}>{l.duration}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )) : (
          /* Fallback: flat list when no modules */
          <div>
            <p className="px-3 mb-1" style={{
              fontSize: ".62rem", color: "#334155",
              textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700,
            }}>Lessons</p>
            {lessons.map((l) => {
              const done     = isDone(l._id);
              const isActive = l._id.toString() === (activeId || "").toString();
              return (
                <button key={l._id}
                  onClick={() => { setActiveId(l._id); setMobileMenuOpen(false); }}
                  className="d-flex align-items-center gap-2 w-100 text-start"
                  style={{
                    padding: "9px 14px", background: isActive ? "rgba(245,158,11,.1)" : "transparent",
                    border: "none", borderLeft: `3px solid ${isActive ? "#f59e0b" : "transparent"}`,
                    cursor: "pointer", transition: "all .15s",
                  }}>
                  <span className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{
                      width: 22, height: 22, borderRadius: "50%", fontSize: ".68rem",
                      background: done ? "#22c55e" : isActive ? "#f59e0b" : "#1e293b",
                      color: done || isActive ? "#0f172a" : "#64748b",
                      border: `2px solid ${done ? "#22c55e" : isActive ? "#f59e0b" : "#334155"}`,
                    }}>
                    {done ? "✓" : l.order}
                  </span>
                  <span style={{
                    fontSize: ".84rem", color: done ? "#4ade80" : isActive ? "#f59e0b" : "#94a3b8",
                    fontWeight: isActive ? 600 : 400,
                  }}>{l.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-3" style={{ borderTop: "1px solid #1e293b", flexShrink: 0 }}>
        {allDone ? (
          <div className="d-grid gap-2">
            <Link to={`/quiz/${courseId}`} className="btn btn-sm fw-bold"
              style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
              📝 Take the Quiz
            </Link>
            <button className="btn btn-sm fw-semibold" disabled={certLoading}
              style={{ background: "#0d3321", color: "#4ade80", border: "1px solid #22c55e33" }}
              onClick={handleGetCert}>
              {certLoading
                ? <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                : "🏆 Get Certificate"
              }
            </button>
          </div>
        ) : (
          <p style={{ color: "#334155", fontSize: ".72rem", margin: 0, textAlign: "center" }}>
            Complete all lessons to unlock quiz & certificate
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>

      {/* ── Desktop sidebar ────────────────────────────────────────────────── */}
      <div className="d-none d-lg-flex flex-column flex-shrink-0"
        style={{
          width: 290, background: "#0b1120",
          borderRight: "1px solid #1e293b",
          minHeight: "calc(100vh - 56px)",
          maxHeight: "calc(100vh - 56px)",
          position: "sticky", top: 56,
        }}>
        <SidebarContent />
      </div>

      {/* ── Mobile lesson drawer overlay ────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="d-lg-none" style={{
          position: "fixed", inset: 0, zIndex: 1050,
          background: "rgba(0,0,0,.7)",
        }} onClick={() => setMobileMenuOpen(false)}>
          <div style={{
            position: "absolute", top: 56, left: 0, bottom: 0, width: "85%", maxWidth: 320,
            background: "#0b1120", display: "flex", flexDirection: "column",
          }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-grow-1 d-flex flex-column" style={{ background: "#0f172a", minWidth: 0 }}>

        {/* Mobile top bar */}
        <div className="d-lg-none d-flex align-items-center justify-content-between px-3 py-2"
          style={{ background: "#0b1120", borderBottom: "1px solid #1e293b" }}>
          <button onClick={() => setMobileMenuOpen(true)}
            className="btn btn-sm d-flex align-items-center gap-2"
            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
            ☰ Lessons
          </button>
          <div style={{ fontSize: ".78rem", color: "#64748b" }}>
            {completed.length}/{lessons.length} done
          </div>
          <div style={{ background: "#1e293b", borderRadius: 99, height: 6, width: 80 }}>
            <div style={{
              width: `${progress}%`, height: "100%", borderRadius: 99,
              background: progress === 100 ? "#22c55e" : "#f59e0b",
            }} />
          </div>
        </div>

        {/* Alert */}
        {msg.text && (
          <div className="px-3 pt-3">
            <AlertMsg type={msg.type} msg={msg.text} onClose={() => setMsg({ type: "", text: "" })} />
          </div>
        )}

        {/* 100% completion banner */}
        {allDone && (
          <div className="mx-3 mt-3 rounded-3 p-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
            style={{ background: "#0d3321", border: "1px solid #22c55e55" }}>
            <span style={{ color: "#4ade80", fontWeight: 700, fontSize: ".9rem" }}>
              🎉 {user?.name}, you've completed this course!
            </span>
            <div className="d-flex gap-2 flex-wrap">
              <Link to={`/quiz/${courseId}`} className="btn btn-sm fw-bold"
                style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                📝 Take Quiz
              </Link>
              <button className="btn btn-sm fw-bold" disabled={certLoading}
                style={{ background: "#22c55e", color: "#0f172a", border: "none" }}
                onClick={handleGetCert}>
                {certLoading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Generating…</>
                  : `🏆 Download Certificate for ${user?.name}`
                }
              </button>
            </div>
          </div>
        )}

        {!activeLesson ? (
          <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div style={{ fontSize: 64 }}>🎬</div>
              <p className="mt-3" style={{ color: "#475569" }}>No lessons available yet.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video */}
            <div style={{ background: "#000" }}>
              {activeLesson.videoUrl ? (
                <div style={{ aspectRatio: "16/9", maxHeight: "60vh" }}>
                  <iframe key={activeLesson._id}
                    src={toEmbed(activeLesson.videoUrl)}
                    title={activeLesson.title}
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center"
                  style={{ height: 240, background: "#020617" }}>
                  <span style={{ color: "#334155", fontSize: 64 }}>🎬</span>
                </div>
              )}
            </div>

            {/* Lesson info */}
            <div className="p-3 p-md-4 flex-grow-1" style={{ background: "#fff", overflowY: "auto" }}>
              {/* Breadcrumb */}
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                <div>
                  {activeLesson.module && activeLesson.module !== "General" && (
                    <p style={{ color: "#f59e0b", fontSize: ".75rem", fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>
                      📁 {activeLesson.module}
                    </p>
                  )}
                  <p style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 4 }}>
                    Lesson {activeIdx + 1} / {lessons.length}
                  </p>
                  <h2 className="fw-black mb-0" style={{ color: "#0f172a", fontSize: "clamp(1.1rem,3vw,1.4rem)" }}>
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Mark Complete button */}
                {isDone(activeLesson._id) ? (
                  <span className="d-flex align-items-center gap-2 fw-bold px-3 py-2 rounded-2 flex-shrink-0"
                    style={{ background: "#dcfce7", color: "#166534", fontSize: ".85rem",
                             border: "1px solid #bbf7d0" }}>
                    ✓ Completed
                  </span>
                ) : (
                  <button className="btn fw-bold flex-shrink-0" disabled={marking}
                    style={{ background: "#f59e0b", color: "#0f172a", border: "none",
                             borderRadius: 8, fontSize: ".9rem" }}
                    onClick={() => handleComplete(activeLesson._id)}>
                    {marking
                      ? <><span className="spinner-border spinner-border-sm me-2" />Marking…</>
                      : "✓ Mark as Complete"
                    }
                  </button>
                )}
              </div>

              {/* Notes */}
              {activeLesson.notes && (
                <div className="rounded-3 p-3 mb-4"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <h6 className="fw-bold mb-2" style={{ color: "#0f172a" }}>📄 Notes</h6>
                  <p className="mb-0" style={{ color: "#475569", whiteSpace: "pre-line", lineHeight: 1.75, fontSize: ".9rem" }}>
                    {activeLesson.notes}
                  </p>
                </div>
              )}

              {/* Prev / Next navigation */}
              <div className="d-flex gap-2 flex-wrap mt-3">
                {activeIdx > 0 && (
                  <button className="btn btn-sm fw-semibold"
                    style={{ background: "#f1f5f9", color: "#0f172a", border: "none" }}
                    onClick={() => setActiveId(lessons[activeIdx - 1]._id)}>
                    ← Previous
                  </button>
                )}
                {activeIdx < lessons.length - 1 && (
                  <button className="btn btn-sm fw-bold"
                    style={{ background: "#0f172a", color: "#fff", border: "none" }}
                    onClick={() => setActiveId(lessons[activeIdx + 1]._id)}>
                    Next Lesson →
                  </button>
                )}
                {activeIdx === lessons.length - 1 && allDone && (
                  <Link to={`/quiz/${courseId}`} className="btn btn-sm fw-bold"
                    style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                    📝 Take the Quiz
                  </Link>
                )}
              </div>

              {/* Mobile: inline lesson list */}
              <div className="d-lg-none mt-4">
                <h6 className="fw-bold mb-3 pb-2" style={{ color: "#0f172a", borderBottom: "2px solid #f59e0b" }}>
                  All Lessons
                </h6>
                {modules.length > 0 ? modules.map(mod => (
                  <div key={mod.name} className="mb-3">
                    <p className="fw-bold mb-2" style={{ color: "#f59e0b", fontSize: ".78rem",
                                                          textTransform: "uppercase", letterSpacing: ".08em" }}>
                      📁 {mod.name}
                    </p>
                    <div className="d-flex flex-column gap-1">
                      {mod.lessons.map((l) => {
                        const done     = isDone(l._id);
                        const isActive = l._id.toString() === (activeId || "").toString();
                        return (
                          <button key={l._id}
                            onClick={() => setActiveId(l._id)}
                            className="d-flex align-items-center gap-2 rounded-2 text-start"
                            style={{
                              padding: "8px 12px",
                              background: isActive ? "rgba(245,158,11,.08)" : "#f8fafc",
                              border: `1px solid ${isActive ? "#f59e0b" : "#e2e8f0"}`,
                              cursor: "pointer",
                            }}>
                            <span className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                              style={{
                                width: 20, height: 20, borderRadius: "50%", fontSize: ".65rem",
                                background: done ? "#22c55e" : isActive ? "#f59e0b" : "#e2e8f0",
                                color: done || isActive ? "#fff" : "#94a3b8",
                              }}>
                              {done ? "✓" : l.order}
                            </span>
                            <span style={{ fontSize: ".85rem", color: "#334155", fontWeight: isActive ? 600 : 400 }}>
                              {l.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )) : lessons.map((l) => {
                  const done     = isDone(l._id);
                  const isActive = l._id.toString() === (activeId || "").toString();
                  return (
                    <button key={l._id} onClick={() => setActiveId(l._id)}
                      className="d-flex align-items-center gap-2 rounded-2 text-start w-100 mb-1"
                      style={{
                        padding: "8px 12px",
                        background: isActive ? "rgba(245,158,11,.08)" : "#f8fafc",
                        border: `1px solid ${isActive ? "#f59e0b" : "#e2e8f0"}`,
                        cursor: "pointer",
                      }}>
                      <span className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 20, height: 20, borderRadius: "50%", fontSize: ".65rem",
                                 background: done ? "#22c55e" : isActive ? "#f59e0b" : "#e2e8f0",
                                 color: done || isActive ? "#fff" : "#94a3b8" }}>
                        {done ? "✓" : l.order}
                      </span>
                      <span style={{ fontSize: ".85rem", color: "#334155" }}>{l.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
