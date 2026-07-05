import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { getAdminCourseDetail } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import AlertMsg from "../../components/AlertMsg";
import Spinner from "../../components/Spinner";

const inputStyle = { background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 };
const labelStyle = { color: "#94a3b8", fontSize: ".82rem", fontWeight: 600 };

export default function AdminAddLesson() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [courseTitle,    setCourseTitle]    = useState("");
  const [existingCount,  setExistingCount]  = useState(0);
  const [form,     setForm]     = useState({ title: "", description: "", videoUrl: "", notes: "", order: 1 });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  useEffect(() => {
    getAdminCourseDetail(id)
      .then(({ course }) => {
        setCourseTitle(course.title);
        const cnt = course.lessons?.length || 0;
        setExistingCount(cnt);
        setForm(f => ({ ...f, order: cnt + 1 }));
      })
      .catch(() => setError("Failed to load course."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Lesson title is required."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      await API.post("/lessons", { courseId: id, ...form, order: Number(form.order) });
      setSuccess("Lesson added!");
      const newCount = existingCount + 1;
      setExistingCount(newCount);
      setForm({ title: "", description: "", videoUrl: "", notes: "", order: newCount + 1 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson.");
    } finally { setLoading(false); }
  };

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>
        <div className="px-4 py-4 d-flex align-items-center gap-3 flex-wrap"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <Link to="/admin/courses" className="btn btn-sm"
            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>← Back</Link>
          <div>
            <h3 className="fw-black text-white mb-0">Add Lesson</h3>
            {courseTitle && (
              <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".82rem" }}>
                {courseTitle} · <span style={{ color: "#f59e0b" }}>{existingCount} lesson{existingCount !== 1 ? "s" : ""} so far</span>
              </p>
            )}
          </div>
        </div>

        <div className="p-4 fade-in">
          {fetching ? <Spinner /> : (
            <div className="rounded-3 p-4" style={{ background: "#1e293b", border: "1px solid #334155", maxWidth: 720 }}>
              <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
              <AlertMsg msg={error} onClose={() => setError("")} />

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Lesson Title *</label>
                  <input className="form-control" style={inputStyle} value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Introduction to React Hooks" required />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Short Description</label>
                  <textarea className="form-control" rows={2} style={inputStyle} value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="What does this lesson cover?" />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>YouTube Video URL</label>
                  <input className="form-control" style={inputStyle} value={form.videoUrl}
                    onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..." />
                  <div className="form-text" style={{ color: "#475569", fontSize: ".75rem" }}>
                    Paste any YouTube watch URL — it will be auto-converted to an embed.
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" style={labelStyle}>Notes / Text Content</label>
                  <textarea className="form-control" rows={5} style={inputStyle} value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Lesson notes shown below the video…" />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={labelStyle}>Lesson Order</label>
                  <input type="number" min={1} className="form-control" style={{ ...inputStyle, maxWidth: 100 }}
                    value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                </div>

                <div className="d-flex gap-3 flex-wrap">
                  <button type="submit" disabled={loading} className="btn fw-bold px-5"
                    style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" />Adding…</> : "+ Add Lesson"}
                  </button>
                  <button type="button" className="btn fw-semibold"
                    style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}
                    onClick={() => navigate(`/admin/courses/edit/${id}`)}>
                    Done — View Course
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
