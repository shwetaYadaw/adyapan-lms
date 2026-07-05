/**
 * AlertMsg — reusable dismissible alert.
 * Works on both light and dark backgrounds.
 * type: "success" | "danger" | "warning" | "info"
 */
export default function AlertMsg({ type = "danger", msg, onClose }) {
  if (!msg) return null;

  const styles = {
    success: { bg: "#0f2d1f", border: "#22c55e", color: "#4ade80" },
    danger:  { bg: "#2d0f12", border: "#ef4444", color: "#f87171" },
    warning: { bg: "#2d1f00", border: "#f59e0b", color: "#fbbf24" },
    info:    { bg: "#0f1e2d", border: "#3b82f6", color: "#60a5fa" },
  };

  const s = styles[type] || styles.danger;

  return (
    <div
      className="d-flex align-items-start justify-content-between gap-2 rounded-2 p-3 mb-3"
      role="alert"
      style={{
        background:   s.bg,
        border:       `1px solid ${s.border}`,
        color:        s.color,
        fontSize:     ".88rem",
        lineHeight:   1.5,
      }}
    >
      <span className="flex-grow-1">{msg}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent",
            border:     "none",
            color:      s.color,
            cursor:     "pointer",
            padding:    "0 2px",
            fontSize:   "1rem",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
