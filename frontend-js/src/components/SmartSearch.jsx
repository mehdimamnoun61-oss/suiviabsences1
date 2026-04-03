import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const ACTIONS_BY_ROLE = {
  admin: [
    { id: "add-etudiant", label: "Ajouter un etudiant",  sub: "Action rapide", icon: "👤", path: "/etudiants",       keywords: ["add student","ajouter etudiant","new student"] },
    { id: "add-absence",  label: "Saisir les absences",  sub: "Action rapide", icon: "📋", path: "/saisie-absences", keywords: ["add absence","saisir absence","marquer"] },
    { id: "add-classe",   label: "Ajouter une classe",   sub: "Action rapide", icon: "🏫", path: "/classes",         keywords: ["add class","ajouter classe","new class"] },
    { id: "dashboard",    label: "Aller au Dashboard",   sub: "Navigation",    icon: "📊", path: "/",                keywords: ["dashboard","accueil","home"] },
    { id: "rapports",     label: "Rapport etudiant",     sub: "Navigation",    icon: "📈", path: "/rapport-etudiant",keywords: ["rapport","report"] },
  ],
  enseignant: [
    { id: "add-absence",  label: "Saisir les absences",  sub: "Action rapide", icon: "📋", path: "/saisie-absences", keywords: ["saisir absence","marquer","absences"] },
    { id: "dashboard",    label: "Aller au Dashboard",   sub: "Navigation",    icon: "📊", path: "/",                keywords: ["dashboard","accueil","home"] },
    { id: "mes-etudiants",label: "Mes etudiants",        sub: "Navigation",    icon: "👥", path: "/mes-etudiants",   keywords: ["etudiants","mes etudiants"] },
  ],
  administration: [
    { id: "add-etudiant",  label: "Ajouter un etudiant",  sub: "Action rapide", icon: "👤", path: "/etudiants",        keywords: ["add student","ajouter etudiant"] },
    { id: "absences",      label: "Voir les absences",     sub: "Navigation",    icon: "⏰", path: "/absences",         keywords: ["absences","voir absences"] },
    { id: "avertissements",label: "Avertissements",        sub: "Navigation",    icon: "🚨", path: "/avertissements",   keywords: ["avertissement","alerte"] },
    { id: "dashboard",     label: "Aller au Dashboard",    sub: "Navigation",    icon: "📊", path: "/",                 keywords: ["dashboard","accueil","home"] },
    { id: "rapports",      label: "Rapport etudiant",      sub: "Navigation",    icon: "📈", path: "/rapport-etudiant", keywords: ["rapport","report"] },
    { id: "feuille",       label: "Feuille de presence",   sub: "Navigation",    icon: "📋", path: "/feuille-presence", keywords: ["feuille","presence"] },
  ],
}

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(79,70,229,0.15)", color: "var(--primary)", borderRadius: 3, padding: "0 1px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function getNiveau(taux) {
  if (taux >= 30) return { label: "Convocation", color: "#EF4444" }
  if (taux >= 20) return { label: "Avertissement", color: "#F59E0B" }
  if (taux >= 10) return { label: "Observation", color: "#F97316" }
  return { label: "Normal", color: "#22C55E" }
}

export default function SmartSearch({ open, onClose }) {
  const navigate = useNavigate()
  const role = localStorage.getItem("role") || "admin"
  const ACTIONS = ACTIONS_BY_ROLE[role] || ACTIONS_BY_ROLE.admin
  const [query,    setQuery]    = useState("")
  const [results,  setResults]  = useState({ etudiants: [], classes: [], actions: [] })
  const [loading,  setLoading]  = useState(false)
  const [active,   setActive]   = useState(0)
  const [history,  setHistory]  = useState(() => JSON.parse(localStorage.getItem("searchHistory") || "[]"))
  const inputRef   = useRef(null)
  const listRef    = useRef(null)

  // Data cache
  const cache = useRef({ etudiants: null, classes: null })

  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      // Preload data
      if (!cache.current.etudiants) {
        Promise.all([api.get("/etudiants"), api.get("/classes")]).then(([e, c]) => {
          cache.current.etudiants = e.data
          cache.current.classes   = c.data
        }).catch(() => {})
      }
    }
  }, [open])

  // Debounced search
  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults({ etudiants: [], classes: [], actions: [] }); return }
    setLoading(true)
    const lower = q.toLowerCase()

    // Actions
    const actions = ACTIONS.filter(a =>
      a.label.toLowerCase().includes(lower) ||
      a.keywords.some(k => k.includes(lower))
    )

    // Etudiants
    const etudiants = (cache.current.etudiants || [])
      .filter(e => `${e.nom} ${e.prenom} ${e.email}`.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(e => {
        const classe = (cache.current.classes || []).find(c => String(c.id) === String(e.classe_id))
        return { ...e, classeNom: classe?.nom_classe || "" }
      })

    // Classes
    const classes = (cache.current.classes || [])
      .filter(c => `${c.nom_classe} ${c.filiere} ${c.niveau}`.toLowerCase().includes(lower))
      .slice(0, 4)

    setResults({ etudiants, classes, actions })
    setLoading(false)
    setActive(0)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 150)
    return () => clearTimeout(t)
  }, [query, doSearch])

  // Flatten all results for keyboard nav
  const flat = [
    ...results.actions.map(a => ({ type: "action", data: a })),
    ...results.etudiants.map(e => ({ type: "etudiant", data: e })),
    ...results.classes.map(c => ({ type: "classe", data: c })),
  ]

  const handleSelect = (item) => {
    if (item.type === "action")   navigate(item.data.path)
    if (item.type === "etudiant") navigate(`/rapport-etudiant`)
    if (item.type === "classe")   navigate(`/rapport-classe`)
    // Save to history
    const entry = item.type === "action" ? item.data.label : item.type === "etudiant" ? `${item.data.nom} ${item.data.prenom}` : item.data.nom_classe
    const newH = [entry, ...history.filter(h => h !== entry)].slice(0, 5)
    setHistory(newH)
    localStorage.setItem("searchHistory", JSON.stringify(newH))
    onClose()
  }

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, flat.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === "Enter" && flat[active]) handleSelect(flat[active])
    if (e.key === "Escape") onClose()
  }

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: "nearest" })
  }, [active])

  if (!open) return null

  const totalResults = flat.length
  const showHistory  = !query.trim() && history.length > 0

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-modal" onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className="ss-input-wrap">
          <svg className="ss-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="ss-input"
            placeholder="Rechercher etudiant, classe, absence..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          {loading && <div className="ss-spinner" />}
          {query && !loading && (
            <button className="ss-clear" onClick={() => setQuery("")}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <kbd className="ss-esc" onClick={onClose}>Esc</kbd>
        </div>

        {/* Results */}
        <div className="ss-body" ref={listRef}>

          {/* History */}
          {showHistory && (
            <div className="ss-section">
              <div className="ss-section-title">Recherches recentes</div>
              {history.map((h, i) => (
                <div key={i} className="ss-item" onClick={() => setQuery(h)}>
                  <span className="ss-item-icon ss-icon-history">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                    </svg>
                  </span>
                  <span className="ss-item-label">{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* No query — quick actions */}
          {!query.trim() && (
            <div className="ss-section">
              <div className="ss-section-title">Actions rapides</div>
              {ACTIONS.slice(0, 4).map((a, i) => (
                <div key={a.id} className={`ss-item ${active === i ? "ss-active" : ""}`}
                  data-idx={i} onClick={() => handleSelect({ type: "action", data: a })}>
                  <span className="ss-item-icon">{a.icon}</span>
                  <div className="ss-item-content">
                    <span className="ss-item-label">{a.label}</span>
                    <span className="ss-item-sub">{a.sub}</span>
                  </div>
                  <kbd className="ss-enter">↵</kbd>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {query && results.actions.length > 0 && (
            <div className="ss-section">
              <div className="ss-section-title">Actions</div>
              {results.actions.map((a, i) => {
                const idx = flat.findIndex(f => f.type === "action" && f.data.id === a.id)
                return (
                  <div key={a.id} className={`ss-item ${active === idx ? "ss-active" : ""}`}
                    data-idx={idx} onClick={() => handleSelect({ type: "action", data: a })}>
                    <span className="ss-item-icon">{a.icon}</span>
                    <div className="ss-item-content">
                      <span className="ss-item-label">{highlight(a.label, query)}</span>
                      <span className="ss-item-sub">{a.sub}</span>
                    </div>
                    <kbd className="ss-enter">↵</kbd>
                  </div>
                )
              })}
            </div>
          )}

          {/* Etudiants */}
          {query && results.etudiants.length > 0 && (
            <div className="ss-section">
              <div className="ss-section-title">Etudiants</div>
              {results.etudiants.map(e => {
                const idx = flat.findIndex(f => f.type === "etudiant" && f.data.id === e.id)
                return (
                  <div key={e.id} className={`ss-item ${active === idx ? "ss-active" : ""}`}
                    data-idx={idx} onClick={() => handleSelect({ type: "etudiant", data: e })}>
                    <div className="ss-avatar">{e.nom[0]}{e.prenom[0]}</div>
                    <div className="ss-item-content">
                      <span className="ss-item-label">{highlight(`${e.nom} ${e.prenom}`, query)}</span>
                      <span className="ss-item-sub">{e.classeNom} — {e.email}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "#CBD5E1" }}>
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          )}

          {/* Classes */}
          {query && results.classes.length > 0 && (
            <div className="ss-section">
              <div className="ss-section-title">Classes</div>
              {results.classes.map(c => {
                const idx = flat.findIndex(f => f.type === "classe" && f.data.id === c.id)
                return (
                  <div key={c.id} className={`ss-item ${active === idx ? "ss-active" : ""}`}
                    data-idx={idx} onClick={() => handleSelect({ type: "classe", data: c })}>
                    <span className="ss-item-icon" style={{ background: "rgba(79,70,229,0.08)", color: "var(--primary)" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </span>
                    <div className="ss-item-content">
                      <span className="ss-item-label">{highlight(c.nom_classe, query)}</span>
                      <span className="ss-item-sub">{c.filiere} — {c.niveau}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "#CBD5E1" }}>
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )
              })}
            </div>
          )}

          {/* No results */}
          {query && totalResults === 0 && !loading && (
            <div className="ss-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <div>Aucun resultat pour <strong>"{query}"</strong></div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Essayez un autre terme</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ss-footer">
          <span><kbd>↑↓</kbd> naviguer</span>
          <span><kbd>↵</kbd> selectionner</span>
          <span><kbd>Esc</kbd> fermer</span>
          {totalResults > 0 && <span style={{ marginLeft: "auto", color: "#94A3B8" }}>{totalResults} resultat{totalResults > 1 ? "s" : ""}</span>}
        </div>
      </div>
    </div>
  )
}
