import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import AlertMsg from "../components/AlertMsg";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name,       setName]      = useState(user?.name || "");
  const [savingP,    setSavingP]   = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [pw,         setPw]        = useState({ current: "", newPass: "", confirm: "" });
  const [savingPw,   setSavingPw]  = useState(false);
  const [pwMsg,      setPwMsg]     = useState({ type: "", text: "" });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setProfileMsg({ type: "danger", text: "Name is required." }); return; }
    setSavingP(true); setProfileMsg({ type: "", text: "" });
    try {
      const res = await API.put("/auth/update-profile", { name: name.trim() });
      updateUser({ name: res.data.user.name });
      setProfileMsg({ type: "success", text: "Profile updated." });
    } catch (err) {
      setProfileMsg({ type: "danger", text: err.response?.data?.message || "Update failed." });
    } finally { setSavingP(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwMsg({ type: "", text: "" });
    if (pw.newPass.length < 6)       { setPwMsg({ type: "danger", text: "Min 6 characters." }); return; }
    if (pw.newPass !== pw.confirm)   { setPwMsg({ type: "danger", text: "Passwords don't match." }); return; }
    setSavingPw(true);
    try {
      await API.put("/auth/change-password", { currentPassword: pw.current, newPassword: pw.newPass });
      setPwMsg({ type: "success", text: "Password changed." });
      setPw({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setPwMsg({ type: "danger", text: err.response?.data?.message || "Failed." });
    } finally { setSavingPw(false); }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "calc(100vh - 56px)" }}>
      <div style={{ background: "#0f172a", padding: "28px 0" }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 className="fw-black text-white mb-0">My Profile</h2>
        </div>
      </div>

      <div className="container py-5 fade-in" style={{ maxWidth: 700 }}>
        {/* Avatar */}
        <div className="rounded-3 p-4 mb-4 d-flex align-items-center gap-4"
          style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-black flex-shrink-0"
            style={{ width: 72, height: 72, background: "#f59e0b", color: "#0f172a", fontSize: 28 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{user?.name}</h4>
            <p className="text-muted mb-1 small">{user?.email}</p>
            <span className="rounded-pill px-3 py-1 fw-semibold"
              style={{ background: user?.role === "admin" ? "#fee2e2" : "#dcfce7",
                       color:      user?.role === "admin" ? "#991b1b" : "#166534", fontSize: ".75rem" }}>
              {user?.role === "admin" ? "Admin" : "Student"}
            </span>
          </div>
        </div>

        {/* Update name */}
        <div className="rounded-3 p-4 mb-4"
          style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Update Profile</h5>
          <AlertMsg type={profileMsg.type} msg={profileMsg.text} onClose={() => setProfileMsg({ type: "", text: "" })} />
          <form onSubmit={handleSaveProfile}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Full Name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email</label>
              <input className="form-control" value={user?.email} disabled readOnly style={{ background: "#f8fafc" }} />
              <div className="form-text">Email cannot be changed.</div>
            </div>
            <button className="btn fw-bold px-4" disabled={savingP}
              style={{ background: "#0f172a", color: "#f59e0b", border: "none" }}>
              {savingP ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-3 p-4"
          style={{ background: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
          <h5 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Change Password</h5>
          <AlertMsg type={pwMsg.type} msg={pwMsg.text} onClose={() => setPwMsg({ type: "", text: "" })} />
          <form onSubmit={handleChangePw}>
            {[
              { label: "Current Password",     key: "current",  auto: "current-password" },
              { label: "New Password",          key: "newPass",  auto: "new-password" },
              { label: "Confirm New Password",  key: "confirm",  auto: "new-password" },
            ].map(({ label, key, auto }) => (
              <div key={key} className="mb-3">
                <label className="form-label fw-semibold small">{label}</label>
                <input type="password" className="form-control" autoComplete={auto}
                  value={pw[key]} onChange={e => setPw({ ...pw, [key]: e.target.value })}
                  required minLength={key !== "current" ? 6 : 1} />
              </div>
            ))}
            <button className="btn fw-bold px-4" disabled={savingPw}
              style={{ background: "#f59e0b", color: "#0f172a", border: "none" }}>
              {savingPw ? <><span className="spinner-border spinner-border-sm me-2" />Updating…</> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
