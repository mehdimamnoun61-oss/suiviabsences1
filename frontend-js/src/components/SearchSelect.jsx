import { useState, useRef, useEffect } from "react"

/**
 * SearchSelect — Modern dropdown with search, dark/light mode, keyboard nav
 * Props:
 *   options: [{ value, label }]
 *   value: current selected value
 *   onChange: (value) => void
 *   placeholder: string
 *   disabled: bool
 */
function SearchSelect({ options = [], value, onChange, placeholder = "Rechercher...", disabled = false }) {
  const [query,  setQuery]  = useState("")
  const [open,   setOpen]   = useState(false)
  const [active, setActive] = useState(-1)
  const ref      = useRef(null)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  const selected = options.find(o => String(o.value) === String(value))

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )

  const handleOpen = () => {
    if (disabled) return
    setOpen(true)
    setQuery("")
    setActive(-1)
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const handleSelect = (opt) => {
    onChange(opt.value)
    setQuery("")
    setOpen(false)
    setActive(-1)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange("")
    setQuery("")
    setOpen(false)
  }

  const handleKey = (e) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleOpen() } return }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, filtered.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === "Enter" && active >= 0 && filtered[active]) { handleSelect(filtered[active]) }
    if (e.key === "Escape") { setOpen(false); setQuery("") }
  }

  // Scroll active into view
  useEffect(() => {
    if (active >= 0) {
      const el = listRef.current?.querySelector(`[data-idx="${active}"]`)
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [active])

  const isDark = document.documentElement.getAttribute("data-theme") === "dark"

  const styles = {
    trigger: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      minHeight: 42,
      padding: "0 12px",
      borderRadius: 10,
      border: `1.5px solid ${open ? "#4F46E5" : isDark ? "#374151" : "#D1D5DB"}`,
      background: disabled ? (isDark ? "#111827" : "#F1F5F9") : open ? (isDark ? "#1E293B" : "white") : (isDark ? "#1F2937" : "#F8FAFC"),
      color: disabled ? (isDark ? "#4B5563" : "#9CA3AF") : (isDark ? "#F9FAFB" : "#111827"),
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: open
        ? `0 0 0 3px rgba(79,70,229,0.2), 0 2px 8px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(79,70,229,0.08)"}`
        : `0 1px 3px ${isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)"}`,
      transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
      outline: "none",
      userSelect: "none",
    },    input: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: 13.5,
      color: isDark ? "#F9FAFB" : "#111827",
      fontFamily: "'Inter', sans-serif",
      cursor: "text",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      right: 0,
      zIndex: 999,
      background: isDark ? "#1F2937" : "white",
      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
      borderRadius: 12,
      boxShadow: isDark
        ? "0 16px 48px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)"
        : "0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)",
      maxHeight: 240,
      overflowY: "auto",
      animation: "ssDropIn 0.18s cubic-bezier(0.4,0,0.2,1)",
    },
    option: (isActive, isSelected) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 14px",
      fontSize: 13.5,
      cursor: "pointer",
      color: isSelected ? "#4F46E5" : (isDark ? "#F9FAFB" : "#111827"),
      fontWeight: isSelected ? 600 : 400,
      background: isSelected
        ? (isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.06)")
        : isActive
        ? (isDark ? "#243044" : "#F8FAFC")
        : "transparent",
      borderBottom: `1px solid ${isDark ? "#1E293B" : "#F3F4F6"}`,
      transition: "background 0.12s",
    }),
  }

  return (
    <>
      <style>{`
        @keyframes ssDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ss-scroll::-webkit-scrollbar { width: 4px; }
        .ss-scroll::-webkit-scrollbar-track { background: transparent; }
        .ss-scroll::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 4px; }
      `}</style>

      <div ref={ref} style={{ position: "relative", width: "100%" }}>
        {/* Trigger */}
        <div
          style={styles.trigger}
          onClick={handleOpen}
          onKeyDown={handleKey}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={open}
        >
          {open ? (
            <input
              ref={inputRef}
              style={styles.input}
              value={query}
              onChange={e => { setQuery(e.target.value); setActive(-1) }}
              onKeyDown={handleKey}
              placeholder={selected ? selected.label : placeholder}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span style={{
              flex: 1, fontSize: 13.5, fontFamily: "'Inter', sans-serif",
              color: selected ? (isDark ? "#F9FAFB" : "#111827") : (isDark ? "#6B7280" : "#9CA3AF"),
              fontStyle: selected ? "normal" : "normal",
            }}>
              {selected ? selected.label : placeholder}
            </span>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {selected && !disabled && (
              <span
                onClick={handleClear}
                style={{ width: 18, height: 18, borderRadius: "50%", background: isDark ? "#374151" : "#E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isDark ? "#9CA3AF" : "#6B7280", fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? "#4B5563" : "#D1D5DB"}
                onMouseLeave={e => e.currentTarget.style.background = isDark ? "#374151" : "#E5E7EB"}
              >×</span>
            )}
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ color: isDark ? "#6B7280" : "#9CA3AF", transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {open && (
          <div style={styles.dropdown} className="ss-scroll" ref={listRef}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px 16px", fontSize: 13, color: isDark ? "#6B7280" : "#9CA3AF", textAlign: "center" }}>
                Aucun resultat
              </div>
            ) : filtered.map((opt, i) => (
              <div
                key={opt.value}
                data-idx={i}
                style={styles.option(active === i, String(opt.value) === String(value))}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActive(i)}
              >
                {String(opt.value) === String(value) && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 7l3.5 3.5L12 3" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{ flex: 1 }}>{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default SearchSelect
