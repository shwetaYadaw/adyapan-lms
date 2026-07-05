import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuiz, submitQuiz, getMyAttempts } from "../services/quizService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

const LETTER = i => String.fromCharCode(65 + i);

export default function QuizPage() {
  const { courseId } = useParams();

  const [quiz,       setQuiz]       = useState(null);
  const [answers,    setAnswers]    = useState([]);
  const [result,     setResult]     = useState(null);
  const [attempts,   setAttempts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [tab,        setTab]        = useState("quiz");

  useEffect(() => {
    (async () => {
      try {
        const [qd, ad] = await Promise.all([getQuiz(courseId), getMyAttempts(courseId)]);
        setQuiz(qd.quiz);
        setAnswers(new Array(qd.quiz.questions.length).fill(null));
        setAttempts(ad.attempts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const handleSelect = (qi, oi) => {
    if (result) return;
    setAnswers(prev => { const c = [...prev]; c[qi] = oi; return c; });
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) { setError("Answer all questions first."); return; }
    setSubmitting(true); setError("");
    try {
      const data = await submitQuiz(courseId, answers);
      setResult(data.result);
      const ad = await getMyAttempts(courseId);
      setAttempts(ad.attempts);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setError("");
  };

  const answered   = answers.filter(a => a !== null).length;
  const totalQ     = quiz?.questions?.length || 0;

  if (loading) return <div className="container mt-5"><Spinner /></div>;
  if (!quiz && error) return (
    <div className="container mt-5">
      <AlertMsg msg={error} />
      <Link to={`/lessons/${courseId}`} className="btn btn-outline-secondary mt-3">← Back to Lessons</Link>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", padding: "28px 0" }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h2 className="fw-black text-white mb-1">{quiz.title}</h2>
              <p style={{ color: "#94a3b8", marginBottom: 0 }}>
                {totalQ} question{totalQ !== 1 ? "s" : ""} &nbsp;·&nbsp;
                Pass mark: <span style={{ color: "#f59e0b" }}>{quiz.passingScore}%</span>
              </p>
            </div>
            <Link to={`/lessons/${courseId}`}
              className="btn btn-sm fw-semibold"
              style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155" }}>
              ← Lessons
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-4 fade-in" style={{ maxWidth: 820 }}>
        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          {["quiz", "history"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="btn btn-sm fw-semibold px-4"
              style={{
                background:   tab === t ? "#0f172a" : "#fff",
                color:        tab === t ? "#f59e0b" : "#64748b",
                border:       tab === t ? "2px solid #f59e0b" : "1px solid #e2e8f0",
              }}>
              {t === "quiz" ? "📝 Quiz" : `📋 History${attempts.length ? ` (${attempts.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* ── Quiz tab ─────────────────────────────────────────────── */}
        {tab === "quiz" && (
          <>
            <AlertMsg msg={error} onClose={() => setError("")} />

            {/* Result banner */}
            {result && (
              <div className="rounded-3 p-4 mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3"
                style={{
                  background: result.passed ? "#f0fdf4" : "#fef2f2",
                  border: `2px solid ${result.passed ? "#22c55e" : "#ef4444"}`,
                }}>
                <div>
                  <h4 className="fw-black mb-1" style={{ color: result.passed ? "#166534" : "#991b1b" }}>
                    {result.passed ? "🎉 Congratulations! You Passed!" : "😔 Not Passed — Try Again"}
                  </h4>
                  <p className="mb-0" style={{ color: result.passed ? "#166534" : "#991b1b" }}>
                    Score: <strong>{result.score}/{result.total}</strong> ({result.percentage}%)
                    &nbsp;·&nbsp; Required: {result.passingScore}%
                  </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  {result.passed && (
                    <Link to="/my-courses" className="btn fw-bold"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                      🏆 Get Certificate
                    </Link>
                  )}
                  <button onClick={handleRetry} className="btn fw-semibold"
                    style={{ background: "#0f172a", color: "#fff", border: "none" }}>
                    🔄 Retry
                  </button>
                </div>
              </div>
            )}

            {/* Answer progress */}
            {!result && (
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="flex-grow-1" style={{ background: "#e2e8f0", borderRadius: 6, height: 8 }}>
                  <div style={{ width: `${(answered / totalQ) * 100}%`, height: "100%",
                               background: "#f59e0b", borderRadius: 6, transition: "width .3s" }} />
                </div>
                <small style={{ color: "#94a3b8", whiteSpace: "nowrap" }}>{answered}/{totalQ} answered</small>
              </div>
            )}

            {/* Questions */}
            {quiz.questions.map((q, qi) => (
              <div key={q._id || qi} className="rounded-3 p-4 mb-3"
                style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                <p className="fw-bold mb-3" style={{ color: "#0f172a" }}>
                  <span className="rounded-2 px-2 py-1 me-2 fw-black"
                    style={{ background: "#0f172a", color: "#f59e0b", fontSize: ".78rem" }}>{qi + 1}</span>
                  {q.question}
                </p>
                <div className="d-grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isSelected = answers[qi] === oi;
                    const correct    = result?.breakdown[qi]?.correctAnswer;
                    let bg = "#f8fafc", border = "#e2e8f0", color = "#334155";
                    if (result) {
                      if (oi === correct)                             { bg = "#f0fdf4"; border = "#22c55e"; color = "#166534"; }
                      else if (isSelected && oi !== correct)         { bg = "#fef2f2"; border = "#ef4444"; color = "#991b1b"; }
                    } else if (isSelected) {
                      bg = "#fffbeb"; border = "#f59e0b"; color = "#92400e";
                    }
                    return (
                      <button key={oi} onClick={() => handleSelect(qi, oi)} disabled={!!result}
                        className="text-start rounded-2 px-3 py-2 fw-semibold"
                        style={{ background: bg, border: `2px solid ${border}`, color, cursor: result ? "default" : "pointer",
                                 transition: "all .15s", fontSize: ".9rem" }}>
                        <span className="rounded-1 px-2 py-0 me-2 fw-bold"
                          style={{ background: border, color: bg, fontSize: ".7rem" }}>{LETTER(oi)}</span>
                        {opt}
                        {result && oi === correct && <span className="ms-2">✓</span>}
                      </button>
                    );
                  })}
                </div>
                {result && q.explanation && (
                  <div className="mt-3 p-3 rounded-2" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <span style={{ color: "#1d4ed8", fontSize: ".85rem" }}>💡 {q.explanation}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Submit */}
            {!result ? (
              <button onClick={handleSubmit} disabled={answers.includes(null) || submitting}
                className="btn fw-bold w-100 py-3"
                style={{ background: "#0f172a", color: "#f59e0b", border: "2px solid #f59e0b", fontSize: "1rem", borderRadius: 10 }}>
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                  : `Submit Quiz — ${answered}/${totalQ} answered`}
              </button>
            ) : (
              <button onClick={handleRetry} className="btn fw-bold w-100 py-3"
                style={{ background: "#f1f5f9", color: "#0f172a", border: "1px solid #e2e8f0", fontSize: "1rem", borderRadius: 10 }}>
                🔄 Retry Quiz
              </button>
            )}
          </>
        )}

        {/* ── History tab ──────────────────────────────────────────── */}
        {tab === "history" && (
          attempts.length === 0 ? (
            <div className="text-center py-5 rounded-3" style={{ background: "#f1f5f9" }}>
              <div style={{ fontSize: 48 }}>📋</div>
              <p className="mt-3 text-muted">No attempts yet.</p>
            </div>
          ) : (
            <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
              <table className="table table-hover mb-0">
                <thead style={{ background: "#0f172a" }}>
                  <tr>
                    {["#","Date","Score","Percentage","Result"].map(h => (
                      <th key={h} style={{ color: "#94a3b8", fontWeight: 600, fontSize: ".82rem", padding: "12px 16px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => (
                    <tr key={a._id}>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: ".85rem" }}>{attempts.length - i}</td>
                      <td style={{ padding: "12px 16px", fontSize: ".82rem", color: "#334155" }}>
                        {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{a.score}/{a.total}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 4, height: 6 }}>
                            <div style={{ width: `${a.percentage}%`, height: "100%", borderRadius: 4,
                                         background: a.passed ? "#22c55e" : "#ef4444" }} />
                          </div>
                          <span style={{ fontSize: ".8rem", fontWeight: 700 }}>{a.percentage}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="rounded-pill px-2 py-1"
                          style={{ background: a.passed ? "#dcfce7" : "#fee2e2",
                                   color:      a.passed ? "#166534"  : "#991b1b",
                                   fontSize: ".75rem", fontWeight: 700 }}>
                          {a.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
