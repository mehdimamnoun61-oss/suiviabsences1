import { useEffect } from "react"

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" },
    error:   { bg: "#fff5f5", border: "#fecaca", color: "#dc2626" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  }
  const c = colors[type] || colors.success

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", gap: 10, minWidth: 260,
      animation: "slideIn 0.3s ease",
    }}>
      <span style={{ fontSize: 18 }}>
        {type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.color, fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  )
}

export default Toast
