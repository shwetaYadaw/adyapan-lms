import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLessons } from "../services/lessonService";
import { updateProgress, getProgress } from "../services/progressService";
import { generateCertificate, downloadCertificate } from "../services/certificateService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

/* ── Convert any YouTube URL to embed URL ────────────────────────────────── */
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

  const [lessons,    setLessons]    = useState([]);
  const [completed,  setCompleted]  = useState([]); // array of id STRINGS
  const [progress,   setProgress]   = useState(0);
  const [active,     setActive]     = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [marking,    setMarking]    = useState(false);
  const [certLoading,setCertLoading]= useState(false);
  const [msg,        setMsg]        = useState({ type: "", text: "" });

  /* ── Fetch lessons + progress ────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ld, pd] = await Promise.all([
        getLessons(courseId),
        getProgress(courseId),
      ]);
      setLessons(ld.lessons || []);
      if (pd.progress) {
        // Normalise IDs to plain strings for reliable comparison
        setCompleted(
          (pd.progress.completedLessons || []).map((id) =>
            typeof id === "object" ? id.toString() : id
          )
        );
        setProgress(pd.progress.percentage || 0);
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to load lessons." });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Mark lesson complete ────────────────────────────────────────────── */
  const handleComplete = async (lessonId) => {
    setMarking(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await updateProgress({ courseId, lessonId, completed: true });

      // Optimistic update — add id to completed immediately
      const idStr = typeof lessonId === "object" ? lessonId.toString() : lessonId;
      setCompleted((prev) =>
        prev.includes(idStr) ? prev : [...prev, idStr]
      );
      setProgress(res.progress?.percentage ?? progress);

      setMsg({ type: "success", text: "✅ Lesson marked as complete!" });

      // If last lesson is now done, reload to get accurate 100%
      if (res.progress?.percentage === 100) {
        await fetchData();
      } else if (active < lessons.length - 1) {
        setTimeout(() => setActive((i) => i + 1), 600);
      }
    } catch {
      setMsg({ type: "danger", text: "Failed to update progress. Try again." });
    } finally {
      setMarking(false);
    }
  };

  /* ── Generate + download certificate ────────────────────────────────── */
  const handleGetCertificate = async () => {
    setCertLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const data = await generateCertificate(courseId);
      setMsg({ type: "success", text: `🎉 Certificate generated for ${user?.name}!` });
      if (data.certificate?.certificateId) {
        await downloadCertificate(
          data.certificate.certificateId,
          `Adyapan-Certificate-${user?.name?.replace(/\s+/g, "-")}.pdf`
        );
      }
    } catch (err) {
      setMsg({
        type: "danger",
        text: err.response?.data?.message || "Certificate generation failed.",
      });
    } finally {
      setCertLoading(false);
    }
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const isDone = (id) => {
    const idStr = typeof id === "object" ? id.toString() : id;
    return completed.includes(idStr);
  };

  const allDone   = lessons.length > 0 && lessons.every((l) => isDone(l._id));
  const lesson    = lessons[active];

  /* ── Loading state ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)" }}>

      {/* ══════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="d-none d-lg-flex flex-column flex-shrink-0"
        style={{
          width: 270,
          background: "#0b1120",
          borderRight: "1px solid #1e293b",
          minHeight: "calc(100vh - 56px)",
          maxHeight: "calc(100vh - 56px)",
          overflowY: "auto",
          position: "sticky",
          top: 56,
        }}
      >
        {/* Back + progress */}
        <div className="p-4" style={{ borderBottom: "1px solid #1e293b" }}>
          <Link
            to={`/courses/${courseId}`}
            style={{ color: "#64748b", textDecoration: "none", fontSize: ".82rem" }}
          >
            ← Back to Course
          </Link>

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>Course Progress</span>
              <span
                className="fw-black"
                style={{ fontSize: ".82rem", color: progress === 100 ? "#22c55e" : "#f59e0b" }}
              >
                {progress}%
              </span>
            </div>
            <div style={{ background: "#1e293b", borderRadius: 6, height: 8 }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  borderRadius: 6,
                  background: progress === 100 ? "#22c55e" : "#f59e0b",
                  transition: "width .6s ease",
                }}
              />
            </div>
            {progress === 100 && (
              <p
                className="mt-1 mb-0 fw-semibold"
                style={{ fontSize: ".72rem", color: "#22c55e" }}
              >
                ✓ All lessons complete
              </p>
            )}
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-grow-1 py-2">
          <p
            className="px-3 mb-1"
            style={{
              fontSize: ".62rem",
              color: "#334155",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              fontWeight: 700,
            }}
          >
            Lessons
          </p>

          {lessons.map((l, i) => {
            const done     = isDone(l._id);
            const isActive = active === i;
            return (
              <button
                key={l._id}
                onClick={() => setActive(i)}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            10,
                  width:          "100%",
                  padding:        "9px 14px",
                  background:     isActive ? "rgba(245,158,11,.1)" : "transparent",
                  border:         "none",
                  borderLeft:     `3px solid ${isActive ? "#f59e0b" : "transparent"}`,
                  textAlign:      "left",
                  cursor:         "pointer",
                  transition:     "all .15s",
                }}
              >
                {/* Circle indicator */}
                <span
                  className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                  style={{
                    width:      22,
                    height:     22,
                    borderRadius: "50%",
                    fontSize:   ".68rem",
                    background: done ? "#22c55e" : isActive ? "#f59e0b" : "#1e293b",
                    color:      done || isActive ? "#0f172a" : "#64748b",
                    border:     done ? "2px solid #22c55e" : isActive ? "2px solid #f59e0b" : "2px solid #334155",
                    flexShrink: 0,
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>

                <span
                  className="text-truncate"
                  style={{
                    fontSize:   ".84rem",
                    fontWeight: isActive ? 600 : 400,
                    color:      done ? "#4ade80" : isActive ? "#f59e0b" : "#64748b",
                    maxWidth:   190,
                  }}
                >
                  {l.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom actions */}
        <div className="p-3" style={{ borderTop: "1px solid #1e293b" }}>
          {progress === 100 ? (
            <div className="d-grid gap-2">
              <Link
                to={`/quiz/${courseId}`}
                className="btn btn-sm fw-bold"
                style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
              >
                📝 Take the Quiz
              </Link>
              <button
                className="btn btn-sm fw-semibold"
                style={{ background: "#0d3321", color: "#4ade80", border: "1px solid #22c55e33" }}
                onClick={handleGetCertificate}
                disabled={certLoading}
              >
                {certLoading
                  ? <><span className="spinner-border spinner-border-sm me-1" />Generating…</>
                  : "🏆 Download Certificate"
                }
              </button>
            </div>
          ) : (
            <p style={{ color: "#334155", fontSize: ".72rem", margin: 0, textAlign: "center" }}>
              Complete all lessons to unlock quiz & certificate
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{ background: "#0f172a", minWidth: 0, overflowY: "auto" }}
      >
        {/* Alert banner */}
        {msg.text && (
          <div className="px-4 pt-3">
            <AlertMsg
              type={msg.type}
              msg={msg.text}
              onClose={() => setMsg({ type: "", text: "" })}
            />
          </div>
        )}

        {/* ── 100% completion banner ────────────────────────────────── */}
        {progress === 100 && (
          <div
            className="px-4 pt-3"
          >
            <div
              className="rounded-3 p-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
              style={{ background: "#0d3321", border: "1px solid #22c55e55" }}
            >
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: 22 }}>🎉</span>
                <span style={{ color: "#4ade80", fontWeight: 700, fontSize: ".92rem" }}>
                  Congratulations, {user?.name}! You've completed this course.
                </span>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link
                  to={`/quiz/${courseId}`}
                  className="btn btn-sm fw-bold"
                  style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                >
                  📝 Take Quiz
                </Link>
                <button
                  className="btn btn-sm fw-bold"
                  style={{ background: "#22c55e", color: "#0f172a", border: "none" }}
                  onClick={handleGetCertificate}
                  disabled={certLoading}
                >
                  {certLoading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Generating…</>
                    : `🏆 Download Certificate for ${user?.name}`
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {!lesson ? (
          <div className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div style={{ fontSize: 64 }}>🎬</div>
              <p className="mt-3" style={{ color: "#475569" }}>No lessons available yet.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Video ────────────────────────────────────────────── */}
            <div style={{ background: "#000", position: "relative" }}>
              {lesson.videoUrl ? (
                <div style={{ aspectRatio: "16/9", maxHeight: 460 }}>
                  <iframe
                    key={lesson._id}
                    src={toEmbed(lesson.videoUrl)}
                    title={lesson.title}
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: 320, background: "#020617" }}
                >
                  <span style={{ color: "#334155", fontSize: 64 }}>🎬</span>
                </div>
              )}
            </div>

            {/* ── Lesson info ──────────────────────────────────────── */}
            <div
              className="p-4 flex-grow-1"
              style={{ background: "#fff", overflowY: "auto" }}
            >
              {/* Title row */}
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                <div>
                  <p
                    style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 4 }}
                  >
                    Lesson {active + 1} / {lessons.length}
                  </p>
                  <h2
                    className="fw-black mb-0"
                    style={{ color: "#0f172a", fontSize: "1.4rem" }}
                  >
                    {lesson.title}
                  </h2>
                </div>

                {/* Mark complete button / badge */}
                {isDone(lesson._id) ? (
                  <span
                    className="d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2 flex-shrink-0"
                    style={{
                      background: "#dcfce7",
                      color:      "#166534",
                      fontSize:   ".85rem",
                      border:     "1px solid #bbf7d0",
                    }}
                  >
                    ✓ Completed
                  </span>
                ) : (
                  <button
                    className="btn fw-bold flex-shrink-0"
                    style={{ background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: 8 }}
                    onClick={() => handleComplete(lesson._id)}
                    disabled={marking}
                  >
                    {marking
                      ? <><span className="spinner-border spinner-border-sm me-2" />Marking…</>
                      : "✓ Mark as Complete"
                    }
                  </button>
                )}
              </div>

              {/* Notes */}
              {lesson.notes && (
                <div
                  className="mt-3 p-4 rounded-3"
                  style={{
                    background: "#f8fafc",
                    border:     "1px solid #e2e8f0",
                  }}
                >
                  <h6 className="fw-bold mb-2" style={{ color: "#0f172a" }}>
                    📄 Notes
                  </h6>
                  <p
                    className="mb-0"
                    style={{ color: "#475569", whiteSpace: "pre-line", lineHeight: 1.75 }}
                  >
                    {lesson.notes}
                  </p>
                </div>
              )}

              {/* Prev / Next */}
              <div className="d-flex gap-2 mt-4 flex-wrap">
                {active > 0 && (
                  <button
                    className="btn btn-sm fw-semibold"
                    style={{ background: "#f1f5f9", color: "#0f172a", border: "none" }}
                    onClick={() => setActive((a) => a - 1)}
                  >
                    ← Previous
                  </button>
                )}
                {active < lessons.length - 1 && (
                  <button
                    className="btn btn-sm fw-bold"
                    style={{ background: "#0f172a", color: "#fff", border: "none" }}
                    onClick={() => setActive((a) => a + 1)}
                  >
                    Next Lesson →
                  </button>
                )}
                {active === lessons.length - 1 && allDone && (
                  <>
                    <Link
                      to={`/quiz/${courseId}`}
                      className="btn btn-sm fw-bold"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
                    >
                      📝 Take the Quiz
                    </Link>
                    <button
                      className="btn btn-sm fw-bold"
                      style={{ background: "#22c55e", color: "#0f172a", border: "none" }}
                      onClick={handleGetCertificate}
                      disabled={certLoading}
                    >
                      {certLoading
                        ? <><span className="spinner-border spinner-border-sm me-2" />Generating…</>
                        : "🏆 Get Certificate"
                      }
                    </button>
                  </>
                )}
              </div>

              {/* Mobile lesson list (shown below on small screens) */}
              <div className="d-lg-none mt-5">
                <h6
                  className="fw-bold mb-3"
                  style={{ color: "#0f172a", borderBottom: "2px solid #f59e0b", paddingBottom: 8 }}
                >
                  All Lessons
                </h6>
                <div
                  className="progress mb-3"
                  style={{ height: 8, borderRadius: 4, background: "#e2e8f0" }}
                >
                  <div
                    style={{
                      width:      `${progress}%`,
                      height:     "100%",
                      background: progress === 100 ? "#22c55e" : "#f59e0b",
                      borderRadius: 4,
                      transition: "width .5s",
                    }}
                  />
                </div>
                <p className="mb-3" style={{ color: "#64748b", fontSize: ".82rem" }}>
                  {completed.length} / {lessons.length} lessons completed ({progress}%)
                </p>
                <div className="d-flex flex-column gap-1">
                  {lessons.map((l, i) => {
                    const done     = isDone(l._id);
                    const isActive = active === i;
                    return (
                      <button
                        key={l._id}
                        onClick={() => {
                          setActive(i);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="d-flex align-items-center gap-2 rounded-2 text-start"
                        style={{
                          padding:    "8px 12px",
                          background: isActive ? "rgba(245,158,11,.08)" : "#f8fafc",
                          border:     `1px solid ${isActive ? "#f59e0b" : "#e2e8f0"}`,
                          cursor:     "pointer",
                        }}
                      >
                        <span
                          className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                          style={{
                            width:      20,
                            height:     20,
                            borderRadius: "50%",
                            fontSize:   ".65rem",
                            background: done ? "#22c55e" : isActive ? "#f59e0b" : "#e2e8f0",
                            color:      done || isActive ? "#fff" : "#94a3b8",
                          }}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <span
                          style={{
                            fontSize:   ".85rem",
                            color:      done ? "#166534" : isActive ? "#92400e" : "#334155",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {l.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
