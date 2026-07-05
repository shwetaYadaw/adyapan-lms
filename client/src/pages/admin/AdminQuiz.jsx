import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { saveQuiz, deleteQuiz } from "../../services/quizService";
import { getAdminCourseDetail } from "../../services/adminService";
import API from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

const EMPTY_Q = () => ({ question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" });
const LETTER  = i => String.fromCharCode(65 + i);

export default function AdminQuiz() {
  const { courseId } = useParams();
  const [courseTitle,  setCourseTitle]  = useState("");
  const [title,        setTitle]        = useState("Course Quiz");
  const [passingScore, setPassingScore] = useState(60);
  const [questions,    setQuestions]    = useState([EMPTY_Q()]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  useEffect(() => {
    Promise.all([
      getAdminCourseDetail(courseId),
      API.get(`/quiz/${courseId}/admin`).catch(() => null),
    ]).then(([cd, qr]) => {
      setCourseTitle(cd.course.title);
      if (qr?.data?.quiz) {
        const q = qr.data.quiz;
        setTitle(q.title);
        setPassingScore(q.passingScore);
        setQuestions(q.questions.length > 0 ? q.questions : [EMPTY_Q()]);
      }
    }).catch(() => setError("Failed to load quiz."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const addQ    = () => setQuestions(p => [...p, EMPTY_Q()]);
  const removeQ = i  => setQuestions(p => p.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => setQuestions(p => { const c=[...p]; c[i]={...c[i],[field]:val}; return c; });
  const updateOpt = (qi, oi, val) => setQuestions(p => {
    const c=[...p]; const opts=[...c[qi].options]; opts[oi]=val; c[qi]={...c[qi],options:opts}; return c;
  });

  const validate = () => {
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) return `Q${i+1}: question text required.`;
      if (questions[i].options.some(o => !o.trim())) return `Q${i+1}: fill all 4 options.`;
    }
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate(); if (err) { setError(err); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await saveQuiz({ courseId, title, passingScore: Number(passingScore), questions });
      setSuccess("Quiz saved!");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this quiz?")) return;
    try { await deleteQuiz(courseId); setQuestions([EMPTY_Q()]); setSuccess("Quiz deleted."); }
    catch { setError("Delete failed."); }
  };

  if (loading) return (
    <div className="d-flex" style={{ background: "#0f172a", minHeight: "calc(100vh-56px)" }}>
      <AdminSidebar /><div className="flex-grow-1 p-4"><Spinner /></div>
    </div>
  );

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>
        {/* Header */}
        <div className="px-4 py-4 d-flex align-items-center gap-3 flex-wrap"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <Link to="/admin/courses" className="btn btn-sm"
            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>← Back</Link>
          <div>
            <h3 className="fw-black text-white mb-0">Manage Quiz</h3>
            <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".82rem" }}>
              Course: <span style={{ color: "#f59e0b" }}>{courseTitle}</span>
            </p>
          </div>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
          <AlertMsg msg={error} onClose={() => setError("")} />

          <form onSubmit={handleSave}>
            {/* Settings card */}
            <div className="rounded-3 p-4 mb-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small" style={{ color: "#94a3b8" }}>Quiz Title</label>
                  <input className="form-control" value={title} onChange={e => setTitle(e.target.value)}
                    style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 }} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small" style={{ color: "#94a3b8" }}>Passing Score (%)</label>
                  <input type="number" min={0} max={100} className="form-control" value={passingScore}
                    onChange={e => setPassingScore(e.target.value)}
                    style={{ background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 }} />
                </div>
                <div className="col-md-3">
                  <button type="button" onClick={handleDelete} className="btn fw-semibold w-100"
                    style={{ background: "#4c0519", color: "#f87171", border: "1px solid #f8717144" }}>
                    🗑 Delete Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Questions */}
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-3 mb-3 overflow-hidden" style={{ border: "1px solid #334155" }}>
                {/* Question header */}
                <div className="px-4 py-3 d-flex justify-content-between align-items-center"
                  style={{ background: "#1e293b" }}>
                  <span className="fw-bold" style={{ color: "#f59e0b" }}>Question {qi + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQ(qi)} className="btn btn-sm"
                      style={{ background: "#4c0519", color: "#f87171", border: "none", fontSize: ".75rem" }}>
                      Remove
                    </button>
                  )}
                </div>

                <div className="p-4" style={{ background: "#0f172a14" }}>
                  {/* Question text */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small" style={{ color: "#94a3b8" }}>Question *</label>
                    <input className="form-control" value={q.question}
                      onChange={e => updateQ(qi, "question", e.target.value)}
                      placeholder="e.g. What does useState return in React?"
                      required
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 }} />
                  </div>

                  {/* Options */}
                  <div className="row g-2 mb-3">
                    {q.options.map((opt, oi) => {
                      const isCorrect = q.correctAnswer === oi;
                      return (
                        <div key={oi} className="col-md-6">
                          <div className="d-flex gap-2">
                            <span className="rounded-2 d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                              style={{ width: 36, height: 38, background: isCorrect ? "#f59e0b" : "#1e293b",
                                       color: isCorrect ? "#0f172a" : "#64748b", fontSize: ".82rem",
                                       border: `1px solid ${isCorrect ? "#f59e0b" : "#334155"}` }}>
                              {LETTER(oi)}
                            </span>
                            <input className="form-control" value={opt}
                              onChange={e => updateOpt(qi, oi, e.target.value)}
                              placeholder={`Option ${LETTER(oi)}`} required
                              style={{ background: "#1e293b", border: `1px solid ${isCorrect ? "#f59e0b" : "#334155"}`,
                                       color: "#e2e8f0", borderRadius: 8 }} />
                            <button type="button" onClick={() => updateQ(qi, "correctAnswer", oi)}
                              title="Mark as correct"
                              className="btn flex-shrink-0"
                              style={{ background: isCorrect ? "#f59e0b" : "#1e293b",
                                       color:      isCorrect ? "#0f172a" : "#64748b",
                                       border: `1px solid ${isCorrect ? "#f59e0b" : "#334155"}`,
                                       fontSize: ".8rem", padding: "0 10px" }}>
                              ✓
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ color: "#475569", fontSize: ".78rem", marginBottom: 12 }}>
                    Correct answer: <strong style={{ color: "#f59e0b" }}>Option {LETTER(q.correctAnswer)}</strong>
                    &nbsp;— click ✓ to change.
                  </p>

                  {/* Explanation */}
                  <div>
                    <label className="form-label fw-semibold small" style={{ color: "#94a3b8" }}>
                      Explanation <span style={{ fontWeight: 400 }}>(optional — shown after quiz)</span>
                    </label>
                    <input className="form-control form-control-sm" value={q.explanation}
                      onChange={e => updateQ(qi, "explanation", e.target.value)}
                      placeholder="Why is this the correct answer?"
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="d-flex gap-3 flex-wrap mt-2">
              <button type="button" onClick={addQ} className="btn fw-semibold"
                style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
                + Add Question
              </button>
              <button type="submit" disabled={saving} className="btn fw-bold px-5"
                style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                  : `Save Quiz (${questions.length} question${questions.length !== 1 ? "s" : ""})`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
