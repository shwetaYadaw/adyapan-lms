import { useEffect, useState } from "react";
import { getAllCertificates } from "../../services/adminService";
import AdminSidebar from "../../components/AdminSidebar";
import Spinner from "../../components/Spinner";
import AlertMsg from "../../components/AlertMsg";

const buildPdfUrl = (certificateUrl) => {
  if (!certificateUrl) return null;
  const filename = certificateUrl.replace(/\\/g, "/").split("/").pop();
  const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/api$/, "");
  return `${base}/certificates/${filename}`;
};

export default function AdminCertificates() {
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    getAllCertificates()
      .then(({ certificates }) => setCerts(certificates))
      .catch(() => setError("Failed to load certificates."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = certs.filter(c => {
    const q = search.toLowerCase();
    return (
      c.student?.name?.toLowerCase().includes(q) ||
      c.student?.email?.toLowerCase().includes(q) ||
      c.course?.title?.toLowerCase().includes(q) ||
      c.certificateId?.toLowerCase().includes(q)
    );
  });

  const td = { padding: "13px 16px", verticalAlign: "middle" };

  return (
    <div className="d-flex" style={{ minHeight: "calc(100vh - 56px)", background: "#0f172a" }}>
      <AdminSidebar />
      <main className="flex-grow-1" style={{ overflowY: "auto" }}>

        {/* Header */}
        <div className="px-4 py-4" style={{ borderBottom: "1px solid #1e293b" }}>
          <h3 className="fw-black mb-0" style={{ color: "#ffffff" }}>Certificates Issued</h3>
          <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".85rem" }}>
            {certs.length} certificate{certs.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="p-4 fade-in">
          <AlertMsg msg={error} />

          {/* Search */}
          <div className="mb-4">
            <input
              className="form-control"
              placeholder="🔍  Search by student, course or certificate ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                maxWidth: 460,
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#e2e8f0",
                borderRadius: 8,
              }}
            />
          </div>

          {loading ? <Spinner /> : (
            <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #1e293b" }}>
              <table className="table mb-0" style={{ background: "transparent", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    {["#", "Student", "Course", "Certificate ID", "Issued On", "PDF"].map(h => (
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...td, textAlign: "center", color: "#64748b", padding: "40px" }}>
                        No certificates found.
                      </td>
                    </tr>
                  ) : filtered.map((c, i) => {
                    const pdfUrl = buildPdfUrl(c.certificateUrl);
                    return (
                      <tr
                        key={c._id}
                        style={{ borderTop: "1px solid #1e293b" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1a2234"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {/* # */}
                        <td style={{ ...td, color: "#64748b", fontSize: ".8rem" }}>{i + 1}</td>

                        {/* Student */}
                        <td style={td}>
                          <div className="fw-semibold" style={{ color: "#e2e8f0", fontSize: ".9rem" }}>
                            {c.student?.name || "—"}
                          </div>
                          <div style={{ color: "#64748b", fontSize: ".76rem" }}>
                            {c.student?.email}
                          </div>
                        </td>

                        {/* Course */}
                        <td style={td}>
                          <span
                            className="rounded-pill px-2 py-1 fw-semibold"
                            style={{
                              background: "rgba(245,158,11,.15)",
                              color:      "#f59e0b",
                              fontSize:   ".76rem",
                            }}
                          >
                            {c.course?.title || "—"}
                          </span>
                        </td>

                        {/* Certificate ID */}
                        <td style={td}>
                          <code
                            style={{
                              color:      "#fcd34d",
                              fontSize:   ".72rem",
                              background: "rgba(252,211,77,.06)",
                              padding:    "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {c.certificateId}
                          </code>
                        </td>

                        {/* Issued On */}
                        <td style={{ ...td, color: "#94a3b8", fontSize: ".82rem", whiteSpace: "nowrap" }}>
                          {new Date(c.issuedDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>

                        {/* PDF */}
                        <td style={td}>
                          {pdfUrl ? (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                background: "rgba(245,158,11,.12)",
                                color:      "#f59e0b",
                                border:     "1px solid rgba(245,158,11,.3)",
                                fontSize:   ".76rem",
                              }}
                            >
                              ⬇ PDF
                            </a>
                          ) : (
                            <span style={{ color: "#334155", fontSize: ".8rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
