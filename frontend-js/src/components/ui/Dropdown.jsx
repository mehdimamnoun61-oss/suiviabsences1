import { useState, useRef, useEffect } from "react"

/**
 * Dropdown — generic dropdown menu
 * items: [{ label, icon, onClick, danger? }]
 */
export function Dropdown({ trigger, items = [], align = "right" }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="ui-dropdown-wrap" style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className={`ui-dropdown ui-dropdown-${align}`} role="menu">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="ui-dropdown-divider" />
            ) : (
              <button
                key={i}
                className={`ui-dropdown-item ${item.danger ? "ui-dropdown-item-danger" : ""}`}
                role="menuitem"
                onClick={() => { item.onClick?.(); setOpen(false) }}
              >
                {item.icon && <span className="ui-dropdown-item-icon" aria-hidden="true">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default Dropdown
