import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAdminCourseDetail, updateCourse, deleteLesson } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

const CATS   = ["Programming","Web Development","Data Science","Design","Business","Mathematics","Science","Other"];
const LEVELS = ["Beginner","Intermediate","Advanced"];
const inputStyle = { background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 };
const labelStyle = { color: "#94a3b8", fontSize: ".82rem", fontWeight: 600 };

export default function AdminEditCourse() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,    setForm]    = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getAdminCourseDetail(id)
      .then(({ course }) => {
        const { title, description, category, level, duration, thumbnail } = course;
        setForm({ title, description, category, level, duration: duration || "", thumbnail: thumbnail || "" });
        setLessons(course.lessons || []);
      })
      .catch(() => setError("Failed to load course."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await updateCourse(id, form);
      setSuccess("Course updated successfully.");
    } catch { setError("Failed to update course."); }
    finally  { setSaving(false); }
  };

  const handleDeleteLesson = async (lessonId, title) => {
    if (!window.confirm(`Delete lesson "${title}"?`)) return;
    try {
      await deleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l._id !== lessonId));
    } catch { setError("Failed to delete lesson."); }
  };

  if (loading) return (
    <div className="d-flex" style={{ background: "#0f172a", minHeight: "calc(100vh - 56px)" }}>
      <AdminSidebar /><div className="flex-grow-1 p-5"><Spinner /></div>
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
          <h3 className="fw-black text-white mb-0">Edit Course</h3>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
          <AlertMsg msg={error} onClose={() => setError("")} />

          <div className="row g-4">
            {/* ── Course form ─────────────────────────────────────── */}
            <div className="col-lg-7">
              <div className="rounded-3 p-4" style={{ background: "#1e293b", border: "1px solid #334155" }}>
                <h5 className="fw-bold mb-4" style={{ color: "#f59e0b" }}>Course Details</h5>
                {form && (
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Title</label>
                      <input className="form-control" style={inputStyle} value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Description</label>
                      <textarea className="form-control" rows={4} style={inputStyle} value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-md-4">
                        <label className="form-label" style={labelStyle}>Category</label>
                        <select className="form-select" style={inputStyle} value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}>
                          {CATS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={labelStyle}>Level</label>
                        <select className="form-select" style={inputStyle} value={form.level}
                          onChange={e => setForm({ ...form, level: e.target.value })}>
                          {LEVELS.map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label" style={labelStyle}>Duration</label>
                        <input className="form-control" style={inputStyle} value={form.duration}
                          onChange={e => setForm({ ...form, duration: e.target.value })}
                          placeholder="e.g. 10 hours" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="form-label" style={labelStyle}>Thumbnail URL</label>
                      <input className="form-control" style={inputStyle} value={form.thumbnail}
                        onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                        placeholder="https://..." />
                      {form.thumbnail && (
                        <img src={form.thumbnail} alt="Preview" className="mt-2 rounded-2"
                          style={{ height: 90, objectFit: "cover", border: "1px solid #334155" }}
                          onError={e => e.target.style.display = "none"} />
                      )}
                    </div>
                    <button type="submit" disabled={saving} className="btn fw-bold px-5"
                      style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : "Save Changes"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── Lessons panel ───────────────────────────────────── */}
            <div className="col-lg-5">
              <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #334155" }}>
                <div className="px-4 py-3 d-flex justify-content-between align-items-center"
                  style={{ background: "#1e293b" }}>
                  <span className="fw-bold" style={{ color: "#f59e0b" }}>
                    Lessons <span style={{ color: "#64748b", fontWeight: 400 }}>({lessons.length})</span>
                  </span>
                  <Link to={`/admin/courses/${id}/lessons/add`} className="btn btn-sm fw-semibold"
                    style={{ background: "rgba(34,197,94,.12)", color: "#4ade80",
                             border: "1px solid rgba(34,197,94,.25)", fontSize: ".75rem" }}>
                    + Add Lesson
                  </Link>
                </div>

                {lessons.length === 0 ? (
                  <div className="p-4 text-center" style={{ color: "#475569", background: "#0f172a" }}>
                    No lessons yet.
                  </div>
                ) : (
                  <div style={{ background: "#0f172a" }}>
                    {lessons.map((l, i) => (
                      <div key={l._id}
                        className="d-flex align-items-center justify-content-between px-4 py-3"
                        style={{ borderTop: "1px solid #1e293b" }}>
                        <div className="d-flex align-items-center gap-3 min-w-0">
                          <span className="rounded-2 d-flex align-items-center justify-content-center fw-black flex-shrink-0"
                            style={{ width: 26, height: 26, background: "#f59e0b", color: "#0f172a", fontSize: ".72rem" }}>
                            {l.order ?? i + 1}
                          </span>
                          <span className="text-truncate" style={{ color: "#e2e8f0", fontSize: ".85rem" }}>
                            {l.title}
                          </span>
                        </div>
                        <button className="btn btn-sm flex-shrink-0"
                          style={{ background: "#4c0519", color: "#f87171",
                                   border: "1px solid rgba(248,113,113,.3)", fontSize: ".72rem" }}
                          onClick={() => handleDeleteLesson(l._id, l.title)}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3" style={{ borderTop: "1px solid #1e293b", background: "#1e293b" }}>
                  <Link to={`/admin/courses/${id}/quiz`} className="btn fw-semibold w-100"
                    style={{ background: "#0f172a", color: "#60a5fa",
                             border: "1px solid rgba(96,165,250,.3)", fontSize: ".82rem" }}>
                    📝 Manage Quiz
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
