import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createCourse } from "../../services/courseService";
import AdminSidebar from "../../components/AdminSidebar";
import AlertMsg from "../../components/AlertMsg";

const CATS   = ["Programming","Web Development","Data Science","Design","Business","Mathematics","Science","Other"];
const LEVELS = ["Beginner","Intermediate","Advanced"];

const inputStyle = { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", borderRadius: 8 };
const labelStyle = { color: "#94a3b8", fontSize: ".82rem", fontWeight: 600 };

export default function AdminAddCourse() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ title: "", description: "", category: "Programming", level: "Beginner", duration: "", thumbnail: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError("Title and description are required."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const { course } = await createCourse(form);
      setSuccess(`"${course.title}" created! Redirecting to add lessons…`);
      setTimeout(() => navigate(`/admin/courses/${course._id}/lessons/add`), 1400);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course.");
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
          <h3 className="fw-black text-white mb-0">Add New Course</h3>
        </div>

        <div className="p-4 fade-in">
          <div className="rounded-3 p-4" style={{ background: "#1e293b", border: "1px solid #334155", maxWidth: 720 }}>
            <AlertMsg type="success" msg={success} />
            <AlertMsg msg={error} onClose={() => setError("")} />

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label" style={labelStyle}>Course Title *</label>
                <input className="form-control" style={inputStyle} value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Complete JavaScript Bootcamp" required />
              </div>

              <div className="mb-4">
                <label className="form-label" style={labelStyle}>Description *</label>
                <textarea className="form-control" rows={4} style={inputStyle} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What will students learn?" required />
              </div>

              <div className="row g-3 mb-4">
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
                  placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" />
                {form.thumbnail && (
                  <img src={form.thumbnail} alt="Preview" className="mt-2 rounded-2"
                    style={{ height: 100, objectFit: "cover", border: "1px solid #334155" }}
                    onError={e => e.target.style.display="none"} />
                )}
              </div>

              <div className="d-flex gap-3">
                <button type="submit" disabled={loading} className="btn fw-bold px-5"
                  style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating…</> : "Create Course"}
                </button>
                <Link to="/admin/courses" className="btn"
                  style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
