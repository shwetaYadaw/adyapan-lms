import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyCertificates, downloadCertificate } from "../services/certificateService";
import Spinner from "../components/Spinner";
import AlertMsg from "../components/AlertMsg";

export default function Certificates() {
  const { user }                              = useAuth();
  const [certs,       setCerts]               = useState([]);
  const [loading,     setLoading]             = useState(true);
  const [downloading, setDownloading]         = useState(null);
  const [msg,         setMsg]                 = useState({ type: "", text: "" });

  useEffect(() => {
    getMyCertificates()
      .then(({ certificates }) => setCerts(certificates))
      .catch(() => setMsg({ type: "danger", text: "Failed to load certificates." }))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (certId, courseName) => {
    setDownloading(certId);
    try {
      // File named after the student so it's personalised
      await downloadCertificate(
        certId,
        `Adyapan-Certificate-${user?.name?.replace(/\s+/g, "-")}-${courseName?.replace(/\s+/g, "-")}.pdf`
      );
      setMsg({ type: "success", text: `Certificate downloaded for ${user?.name}!` });
    } catch {
      setMsg({ type: "danger", text: "Download failed. Please try again." });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: "#0f172a", padding: "28px 0 24px" }}>
        <div className="container-xl">
          <h2 className="fw-black text-white mb-0">My Certificates</h2>
          <p style={{ color: "#64748b", marginBottom: 0, fontSize: ".88rem" }}>
            {certs.length > 0
              ? `${certs.length} certificate${certs.length > 1 ? "s" : ""} earned by ${user?.name}`
              : `Earn certificates by completing courses, ${user?.name?.split(" ")[0]}!`
            }
          </p>
        </div>
      </div>

      <div className="container-xl py-5 fade-in">
        {/* Alert */}
        {msg.text && (
          <div className="mb-4">
            <AlertMsg type={msg.type} msg={msg.text} onClose={() => setMsg({ type: "", text: "" })} />
          </div>
        )}

        {loading ? <Spinner /> : certs.length === 0 ? (

          /* ── Empty state ──────────────────────────────────────────── */
          <div
            className="text-center py-5 rounded-3"
            style={{ background: "#fff", border: "1px solid #e2e8f0" }}
          >
            <div style={{ fontSize: 72 }}>🏆</div>
            <h4 className="fw-bold mt-3 mb-2" style={{ color: "#0f172a" }}>
              No certificates yet, {user?.name?.split(" ")[0]}!
            </h4>
            <p className="text-muted mb-4" style={{ maxWidth: 420, margin: "0 auto 24px" }}>
              Complete all lessons in a course to unlock your certificate.
              Each certificate is personalised with your name.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link
                to="/my-courses"
                className="btn fw-bold px-4"
                style={{ background: "#0f172a", color: "#f59e0b", border: "2px solid #f59e0b" }}
              >
                My Courses
              </Link>
              <Link
                to="/courses"
                className="btn fw-bold px-4"
                style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}
              >
                Browse Courses
              </Link>
            </div>
          </div>

        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {certs.map((cert) => (
              <div key={cert._id} className="col">
                <div
                  className="h-100 d-flex flex-column rounded-3 overflow-hidden"
                  style={{
                    background:  "linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)",
                    border:      "2px solid #f59e0b",
                    boxShadow:   "0 4px 20px rgba(245,158,11,.15)",
                    transition:  "transform .2s, box-shadow .2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform  = "translateY(-4px)";
                    e.currentTarget.style.boxShadow  = "0 12px 32px rgba(245,158,11,.28)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform  = "translateY(0)";
                    e.currentTarget.style.boxShadow  = "0 4px 20px rgba(245,158,11,.15)";
                  }}
                >
                  {/* Gold ribbon */}
                  <div
                    className="text-center py-2 fw-bold"
                    style={{
                      background:    "#f59e0b",
                      color:         "#0f172a",
                      fontSize:      ".7rem",
                      letterSpacing: ".12em",
                    }}
                  >
                    CERTIFICATE OF COMPLETION
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    {/* Trophy */}
                    <div className="text-center mb-2" style={{ fontSize: 52 }}>🏆</div>

                    {/* Student name (personalised) */}
                    <p
                      className="text-center fw-black mb-1"
                      style={{ color: "#f59e0b", fontSize: "1rem", letterSpacing: ".02em" }}
                    >
                      {user?.name}
                    </p>
                    <p
                      className="text-center mb-1"
                      style={{ color: "#94a3b8", fontSize: ".75rem" }}
                    >
                      has successfully completed
                    </p>

                    {/* Course name */}
                    <h5
                      className="text-center fw-bold mb-1"
                      style={{ color: "#fff", fontSize: "1rem" }}
                    >
                      {cert.course?.title || "Course"}
                    </h5>
                    <p
                      className="text-center mb-4"
                      style={{ color: "#64748b", fontSize: ".78rem" }}
                    >
                      {cert.course?.category}{cert.course?.level ? ` · ${cert.course.level}` : ""}
                    </p>

                    {/* Meta details */}
                    <div
                      className="rounded-2 p-3 mb-4"
                      style={{
                        background: "rgba(255,255,255,.05)",
                        border:     "1px solid rgba(255,255,255,.08)",
                      }}
                    >
                      <div className="d-flex justify-content-between mb-2">
                        <span style={{ color: "#64748b", fontSize: ".78rem" }}>Certificate ID</span>
                        <span
                          style={{
                            color:      "#fcd34d",
                            fontSize:   ".72rem",
                            fontFamily: "monospace",
                          }}
                        >
                          {cert.certificateId}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span style={{ color: "#64748b", fontSize: ".78rem" }}>Issued On</span>
                        <span style={{ color: "#e2e8f0", fontSize: ".78rem", fontWeight: 600 }}>
                          {new Date(cert.issuedDate).toLocaleDateString("en-IN", {
                            day:   "numeric",
                            month: "long",
                            year:  "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Download button */}
                    <button
                      className="btn fw-bold w-100 mt-auto"
                      style={{
                        background:   "#f59e0b",
                        color:        "#0f172a",
                        border:       "none",
                        borderRadius: 10,
                        padding:      "11px",
                        fontSize:     ".95rem",
                      }}
                      onClick={() =>
                        handleDownload(cert.certificateId, cert.course?.title || "Certificate")
                      }
                      disabled={downloading === cert.certificateId}
                    >
                      {downloading === cert.certificateId ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Downloading…</>
                      ) : (
                        `⬇ Download — ${user?.name}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
