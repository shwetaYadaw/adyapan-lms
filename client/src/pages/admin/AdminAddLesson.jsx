import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { getAdminCourseDetail } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import AlertMsg from "../../components/AlertMsg";
import Spinner from "../../components/Spinner";

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  color: "#e2e8f0",
  borderRadius: 8,
};
const labelStyle = { color: "#94a3b8", fontSize: ".82rem", fontWeight: 600 };

export default function AdminAddLesson() {
  const { id }    = useParams();   // courseId
  const navigate  = useNavigate();

  const [courseTitle,    setCourseTitle]    = useState("");
  const [existingLessons,setExistingLessons]= useState([]);  // all lessons
  const [modules,        setModules]        = useState([]);  // unique module names
  const [fetching,       setFetching]       = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");

  // Form state
  const [form, setForm] = useState({
    title:       "",
    description: "",
    videoUrl:    "",
    notes:       "",
    duration:    "",
    module:      "",       // free-text or picked from existing
    moduleOrder: 1,
    order:       1,
    isFree:      true,
  });

  const [newModuleName, setNewModuleName] = useState(""); // new module input
  const [useNewModule,  setUseNewModule]  = useState(false);

  useEffect(() => {
    getAdminCourseDetail(id)
      .then(({ course }) => {
        setCourseTitle(course.title);
        const lessons = course.lessons || [];
        setExistingLessons(lessons);
        setForm(f => ({ ...f, order: lessons.length + 1 }));

        // Extract unique module names
        const modNames = [...new Set(lessons.map(l => l.module || "General").filter(Boolean))];
        setModules(modNames);
      })
      .catch(() => setError("Failed to load course info."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Lesson title is required."); return; }

    const moduleName = useNewModule
      ? (newModuleName.trim() || "General")
      : (form.module || "General");

    setLoading(true); setError(""); setSuccess("");
    try {
      await API.post("/lessons", {
        courseId:    id,
        title:       form.title.trim(),
        description: form.description.trim(),
        videoUrl:    form.videoUrl.trim(),
        notes:       form.notes.trim(),
        duration:    form.duration.trim(),
        module:      moduleName,
        moduleOrder: Number(form.moduleOrder) || 1,
        order:       Number(form.order) || existingLessons.length + 1,
        isFree:      form.isFree,
      });

      setSuccess(`Lesson "${form.title}" added to module "${moduleName}"!`);

      // Add new module name to list if not already there
      if (!modules.includes(moduleName)) {
        setModules(prev => [...prev, moduleName]);
      }

      const newCount = existingLessons.length + 1;
      setExistingLessons(prev => [...prev, { title: form.title, module: moduleName }]);

      // Reset form for next lesson
      setForm({
        title: "", description: "", videoUrl: "", notes: "",
        duration: "", module: moduleName, moduleOrder: form.moduleOrder,
        order: newCount + 1, isFree: true,
      });
      setUseNewModule(false);
      setNewModuleName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lesson.");
    } finally {
      setLoading(false);
    }
  };

  // Group existing lessons by module for preview
  const groupedLessons = {};
  existingLessons.forEach(l => {
    const mod = l.module || "General";
    if (!groupedLessons[mod]) groupedLessons[mod] = [];
    groupedLessons[mod].push(l);
  });

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>

        {/* Header */}
        <div className="px-4 py-4 d-flex align-items-center gap-3 flex-wrap"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <Link to="/admin/courses" className="btn btn-sm"
            style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
            ← Back
          </Link>
          <div>
            <h3 className="fw-black text-white mb-0">Add Lesson</h3>
            {courseTitle && (
              <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".82rem" }}>
                Course: <span style={{ color: "#f59e0b" }}>{courseTitle}</span>
                &nbsp;·&nbsp;
                <span style={{ color: "#4ade80" }}>{existingLessons.length} lessons added</span>
              </p>
            )}
          </div>
        </div>

        {fetching ? <div className="p-4"><Spinner /></div> : (
          <div className="p-4 fade-in">
            <div className="row g-4">

              {/* ── Lesson form ──────────────────────────────────────── */}
              <div className="col-lg-7">
                <div className="rounded-3 p-4"
                  style={{ background: "#1e293b", border: "1px solid #334155" }}>
                  <h5 className="fw-bold mb-4" style={{ color: "#f59e0b" }}>Add New Lesson</h5>

                  <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
                  <AlertMsg msg={error} onClose={() => setError("")} />

                  <form onSubmit={handleSubmit}>

                    {/* ── Module selection ─────────────────────────── */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Module / Section</label>
                      <div className="d-flex gap-2 flex-wrap mb-2">
                        {/* Existing module buttons */}
                        {modules.map(mod => (
                          <button key={mod} type="button"
                            onClick={() => { setForm({ ...form, module: mod }); setUseNewModule(false); }}
                            className="btn btn-sm"
                            style={{
                              background: !useNewModule && form.module === mod
                                ? "#f59e0b" : "#0f172a",
                              color:      !useNewModule && form.module === mod
                                ? "#0f172a" : "#94a3b8",
                              border:     "1px solid #334155",
                              fontSize:   ".78rem",
                            }}>
                            {mod}
                          </button>
                        ))}
                        {/* New module button */}
                        <button type="button"
                          onClick={() => setUseNewModule(true)}
                          className="btn btn-sm"
                          style={{
                            background: useNewModule ? "#f59e0b" : "#0f172a",
                            color:      useNewModule ? "#0f172a" : "#94a3b8",
                            border: "1px solid #334155", fontSize: ".78rem",
                          }}>
                          + New Module
                        </button>
                      </div>

                      {/* New module name input */}
                      {useNewModule && (
                        <input className="form-control" style={inputStyle}
                          placeholder="Module name (e.g. Introduction, Advanced Topics)"
                          value={newModuleName}
                          onChange={e => setNewModuleName(e.target.value)} />
                      )}

                      {!useNewModule && modules.length === 0 && (
                        <p style={{ color: "#475569", fontSize: ".75rem", marginTop: 4 }}>
                          No modules yet. Click "+ New Module" to create the first one.
                        </p>
                      )}
                    </div>

                    {/* Module order */}
                    {(useNewModule || modules.length > 0) && (
                      <div className="mb-3">
                        <label className="form-label" style={labelStyle}>Module Order #</label>
                        <input type="number" min={1} className="form-control" style={{ ...inputStyle, maxWidth: 100 }}
                          value={form.moduleOrder}
                          onChange={e => setForm({ ...form, moduleOrder: e.target.value })} />
                        <div style={{ color: "#475569", fontSize: ".72rem", marginTop: 3 }}>
                          Controls the order modules appear in the sidebar.
                        </div>
                      </div>
                    )}

                    <hr style={{ borderColor: "#334155" }} />

                    {/* Lesson title */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Lesson Title *</label>
                      <input className="form-control" style={inputStyle} value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Introduction to React Hooks" required />
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Short Description</label>
                      <textarea className="form-control" rows={2} style={inputStyle}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="What does this lesson cover?" />
                    </div>

                    {/* YouTube URL */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>YouTube Video URL</label>
                      <input className="form-control" style={inputStyle} value={form.videoUrl}
                        onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..." />
                      <div style={{ color: "#475569", fontSize: ".72rem", marginTop: 3 }}>
                        Paste any YouTube URL — it will be auto-embedded for students.
                      </div>
                      {/* Video preview */}
                      {form.videoUrl && (() => {
                        const url = form.videoUrl;
                        const short = url.match(/youtu\.be\/([^?&]+)/);
                        const watch = url.match(/[?&]v=([^&]+)/);
                        const vid = (short?.[1] || watch?.[1]);
                        return vid ? (
                          <div className="mt-2 rounded-2 overflow-hidden" style={{ aspectRatio: "16/9", maxHeight: 180 }}>
                            <iframe src={`https://www.youtube.com/embed/${vid}`}
                              style={{ width: "100%", height: "100%", border: "none" }}
                              title="Preview" allowFullScreen />
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Duration */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Duration (optional)</label>
                      <input className="form-control" style={{ ...inputStyle, maxWidth: 140 }}
                        value={form.duration}
                        onChange={e => setForm({ ...form, duration: e.target.value })}
                        placeholder="e.g. 12:30" />
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="form-label" style={labelStyle}>Lesson Notes</label>
                      <textarea className="form-control" rows={5} style={inputStyle}
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        placeholder="Key concepts, code snippets, links… shown below the video." />
                    </div>

                    {/* Order + Free toggle */}
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <label className="form-label" style={labelStyle}>Lesson Order</label>
                        <input type="number" min={1} className="form-control" style={inputStyle}
                          value={form.order}
                          onChange={e => setForm({ ...form, order: e.target.value })} />
                      </div>
                      <div className="col-6 d-flex align-items-end">
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" id="isFree"
                            checked={form.isFree}
                            onChange={e => setForm({ ...form, isFree: e.target.checked })} />
                          <label className="form-check-label" htmlFor="isFree"
                            style={{ color: "#94a3b8", fontSize: ".82rem" }}>
                            Free preview lesson
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-3 flex-wrap">
                      <button type="submit" disabled={loading} className="btn fw-bold px-5"
                        style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
                        {loading
                          ? <><span className="spinner-border spinner-border-sm me-2" />Adding…</>
                          : "+ Add Lesson"
                        }
                      </button>
                      <button type="button" className="btn fw-semibold"
                        style={{ background: "#0f172a", color: "#94a3b8", border: "1px solid #334155" }}
                        onClick={() => navigate(`/admin/courses/edit/${id}`)}>
                        Done — View Course
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* ── Existing lesson tree ──────────────────────────── */}
              <div className="col-lg-5">
                <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #334155" }}>
                  <div className="px-4 py-3" style={{ background: "#1e293b" }}>
                    <span className="fw-bold" style={{ color: "#f59e0b" }}>
                      Course Structure ({existingLessons.length} lessons)
                    </span>
                  </div>

                  {Object.keys(groupedLessons).length === 0 ? (
                    <div className="p-4" style={{ color: "#475569" }}>
                      No lessons yet. Add your first lesson above.
                    </div>
                  ) : (
                    <div style={{ background: "#0f172a" }}>
                      {Object.entries(groupedLessons).map(([mod, lsns]) => (
                        <div key={mod}>
                          {/* Module header */}
                          <div className="px-4 py-2 d-flex align-items-center gap-2"
                            style={{ background: "rgba(245,158,11,.06)", borderBottom: "1px solid #1e293b" }}>
                            <span style={{ fontSize: ".72rem", color: "#f59e0b", fontWeight: 800,
                                           textTransform: "uppercase", letterSpacing: ".1em" }}>
                              📁 {mod}
                            </span>
                            <span className="rounded-pill px-2 py-0"
                              style={{ background: "rgba(245,158,11,.15)", color: "#f59e0b", fontSize: ".68rem" }}>
                              {lsns.length}
                            </span>
                          </div>
                          {lsns.map((l, i) => (
                            <div key={i} className="d-flex align-items-center gap-2 px-4 py-2"
                              style={{ borderBottom: "1px solid #1e293b" }}>
                              <span className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                style={{ width: 20, height: 20, background: "#22c55e",
                                         color: "#0f172a", fontSize: ".62rem" }}>
                                ✓
                              </span>
                              <span style={{ color: "#94a3b8", fontSize: ".83rem" }}>{l.title}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick tips */}
                <div className="rounded-3 p-4 mt-3"
                  style={{ background: "#1e293b", border: "1px solid #334155" }}>
                  <h6 className="fw-bold mb-3" style={{ color: "#f59e0b" }}>💡 Tips</h6>
                  <ul style={{ color: "#64748b", fontSize: ".82rem", paddingLeft: 16 }}>
                    <li className="mb-2">Group related lessons into <strong style={{ color: "#94a3b8" }}>Modules</strong> (e.g. "Introduction", "Core Concepts", "Advanced Topics")</li>
                    <li className="mb-2">Use <strong style={{ color: "#94a3b8" }}>Module Order</strong> to control which module appears first in the sidebar</li>
                    <li className="mb-2">Paste any <strong style={{ color: "#94a3b8" }}>YouTube URL</strong> — it will auto-embed for students</li>
                    <li>Add notes/code snippets in the <strong style={{ color: "#94a3b8" }}>Notes</strong> field — they appear below the video</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
