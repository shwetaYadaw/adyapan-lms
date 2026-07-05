export default function Spinner({ text = "Loading…" }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-5 gap-3">
      <div className="spinner-border" role="status"
        style={{ color: "#f59e0b", width: "1.6rem", height: "1.6rem", borderWidth: "3px" }}>
        <span className="visually-hidden">Loading…</span>
      </div>
      {text && <span style={{ color: "#64748b", fontSize: ".88rem" }}>{text}</span>}
    </div>
  );
}
