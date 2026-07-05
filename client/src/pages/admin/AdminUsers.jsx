import { useEffect, useState, useCallback } from "react";
import { getAllUsers, deleteUser } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getAllUsers({ search, page, limit: 15 })
      .then(({ users, pagination }) => {
        setUsers(users);
        setPages(pagination.pages);
        setTotal(pagination.total);
      })
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This also removes their enrollments and certificates.`)) return;
    try {
      await deleteUser(id);
      setSuccess(`"${name}" has been removed.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    }
  };

  /* ── shared cell style ───────────────────────────────────────────── */
  const td = { padding: "13px 16px", verticalAlign: "middle" };

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>

        {/* Header */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #1e293b" }}>
          <h3 className="fw-black mb-0" style={{ color: "#ffffff" }}>Manage Students</h3>
          <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".85rem" }}>
            {total} student{total !== 1 ? "s" : ""} registered
          </p>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg type="success" msg={success} onClose={() => setSuccess("")} />
          <AlertMsg msg={error} onClose={() => setError("")} />

          {/* Search */}
          <div className="mb-4">
            <input
              className="form-control"
              placeholder="🔍  Search by name or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                maxWidth: 420,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#e2e8f0",
                borderRadius: 8,
              }}
            />
          </div>

          {loading ? <Spinner /> : (
            <>
              {/* Table */}
              <div className="rounded-3 overflow-hidden mb-4" style={{ border: "1px solid #1e293b" }}>
                <table className="table mb-0" style={{ background: "transparent", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#1e293b" }}>
                      {["#", "Student", "Email", "Role", "Joined", "Action"].map(h => (
                        <th key={h} style={{
                          color: "#94a3b8", fontWeight: 600, fontSize: ".8rem",
                          padding: "13px 16px", borderBottom: "none",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ ...td, textAlign: "center", color: "#64748b", padding: "40px" }}>
                          No students found.
                        </td>
                      </tr>
                    ) : users.map((u, i) => (
                      <tr
                        key={u._id}
                        style={{ borderTop: "1px solid #1e293b" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1a2234"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* # */}
                        <td style={{ ...td, color: "#64748b", fontSize: ".8rem" }}>
                          {(page - 1) * 15 + i + 1}
                        </td>

                        {/* Name + avatar */}
                        <td style={td}>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle fw-black d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 34, height: 34, background: "#f59e0b", color: "#0f172a", fontSize: 14 }}
                            >
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="fw-semibold" style={{ color: "#e2e8f0", fontSize: ".9rem" }}>
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ ...td, color: "#94a3b8", fontSize: ".85rem" }}>
                          {u.email}
                        </td>

                        {/* Role */}
                        <td style={td}>
                          <span
                            className="rounded-pill px-2 py-1 fw-semibold"
                            style={{
                              background: u.role === "admin" ? "#4c0519" : "rgba(245,158,11,.12)",
                              color:      u.role === "admin" ? "#fca5a5" : "#f59e0b",
                              fontSize:   ".72rem",
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Joined */}
                        <td style={{ ...td, color: "#94a3b8", fontSize: ".82rem", whiteSpace: "nowrap" }}>
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* Action */}
                        <td style={td}>
                          {u.role !== "admin" ? (
                            <button
                              className="btn btn-sm fw-semibold"
                              style={{
                                background: "#4c0519",
                                color:      "#fca5a5",
                                border:     "1px solid rgba(252,165,165,.25)",
                                fontSize:   ".75rem",
                              }}
                              onClick={() => handleDelete(u._id, u.name)}
                            >
                              Delete
                            </button>
                          ) : (
                            <span style={{ color: "#334155", fontSize: ".8rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="d-flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-sm"
                    style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
                  >‹</button>

                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="btn btn-sm fw-bold"
                      style={{
                        background: p === page ? "#f59e0b" : "#1e293b",
                        color:      p === page ? "#0f172a" : "#94a3b8",
                        border:     "1px solid #334155",
                        minWidth:   36,
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="btn btn-sm"
                    style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
                  >›</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
