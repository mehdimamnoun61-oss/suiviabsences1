import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../utils/api"
import SmartSearch from "./SmartSearch"

const PAGE_TITLES = {
  "/":                 "Dashboard",
  "/classes":          "Classes",
  "/etudiants":        "Etudiants",
  "/modules":          "Modules",
  "/enseignants":      "Enseignants",
  "/affectations":     "Affectations",
  "/saisie-absences":  "Saisie des absences",
  "/absences":         "Absences",
  "/avertissements":   "Avertissements",
  "/mes-etudiants":    "Mes etudiants",
  "/rapport-etudiant": "Rapport etudiant",
  "/rapport-classe":   "Rapport classe",
  "/feuille-presence": "Feuille de presence",
}

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifs,    setNotifs]    = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [showUser,  setShowUser]  = useState(false)
  const [search,    setSearch]    = useState("")
  const [scrolled,  setScrolled]  = useState(false)
  const [dark,      setDark]      = useState(() => localStorage.getItem("darkMode") === "true")
  const [searchOpen, setSearchOpen] = useState(false)
  const notifRef = useRef(null)
  const userRef  = useRef(null)

  const userName = localStorage.getItem("userName") || "Admin"
  const role     = localStorage.getItem("role") || "admin"
  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const pageTitle = PAGE_TITLES[location.pathname] || "AbsencePro"

  const roleLabel = {
    admin: "Administrateur",
    enseignant: "Enseignant",
    administration: "Administration Pedagogique"
  }

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
    localStorage.setItem("darkMode", dark)
  }, [dark])

  // Load notifications
  useEffect(() => {
    Promise.all([api.get("/absences"), api.get("/etudiants")]).then(([ab, et]) => {
      const c = {}
      ab.data.forEach(a => { if (a.statut === "Absent") c[a.etudiant_id] = (c[a.etudiant_id] || 0) + 1 })
      setNotifs(et.data.map(e => ({ id: e.id, nom: `${e.nom} ${e.prenom}`, total: c[e.id] || 0 })).filter(e => e.total >= 2).slice(0, 6))
    }).catch(() => {})
  }, [location.pathname])

  // Ctrl+K shortcut
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) } }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const logout = () => {
    api.post("/logout").catch(() => {})
    localStorage.removeItem("token")
    localStorage.removeItem("isAuth")
    localStorage.removeItem("role")
    localStorage.removeItem("userName")
    navigate("/login")
  }

  return (
    <>
    <header className={`premium-header ${scrolled ? "scrolled" : ""}`}>

      {/* LEFT */}
      <div className="ph-left">
        <div className="ph-breadcrumb">
          <span className="ph-app">AbsencePro</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#CBD5E1" }}>
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ph-page">{pageTitle}</span>
        </div>
      </div>

      {/* CENTER */}
      <div className="ph-center">
        <div className="ph-search" onClick={() => setSearchOpen(true)} style={{ cursor: "pointer" }}>
          <svg className="ph-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: "#94A3B8", fontFamily: "'Inter', sans-serif" }}>
            Rechercher etudiant, classe...
          </span>
          <kbd className="ph-kbd">⌘K</kbd>
        </div>
      </div>

      {/* RIGHT */}
      <div className="ph-right">

        {/* Dark mode toggle */}
        <button
          className={`dm-toggle ${dark ? "dm-on" : ""}`}
          onClick={() => setDark(d => !d)}
          title={dark ? "Mode clair" : "Mode sombre"}
        >
          <span className="dm-track">
            <span className="dm-thumb">
              {dark ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </span>
          </span>
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button className={`ph-icon-btn ${notifs.length > 0 ? "has-notif" : ""}`}
            onClick={() => { setShowNotif(o => !o); setShowUser(false) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {notifs.length > 0 && (
              <span className="ph-badge">{notifs.length > 9 ? "9+" : notifs.length}</span>
            )}
          </button>

          {showNotif && (
            <div className="ph-dropdown notif-dd">
              <div className="ph-dd-header">
                <span>Notifications</span>
                <span className="ph-dd-badge">{notifs.length} alertes</span>
              </div>
              <div className="ph-dd-body">
                {notifs.length === 0 ? (
                  <div className="ph-dd-empty">Aucune notification</div>
                ) : notifs.map(n => (
                  <div key={n.id} className="ph-notif-item">
                    <div className="ph-notif-dot" />
                    <div className="ph-notif-avatar">{n.nom[0]}</div>
                    <div>
                      <div className="ph-notif-name">{n.nom}</div>
                      <div className="ph-notif-sub">{n.total} absences — avertissement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="ph-divider" />

        {/* User */}
        <div ref={userRef} style={{ position: "relative" }}>
          <button className="ph-user-btn" onClick={() => { setShowUser(o => !o); setShowNotif(false) }}>
            <div className="ph-avatar">{initials}</div>
            <div className="ph-user-info">
              <span className="ph-user-name">{userName}</span>
              <span className="ph-user-role">{roleLabel[role]}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "#94A3B8", transition: "transform 0.2s", transform: showUser ? "rotate(180deg)" : "none" }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showUser && (
            <div className="ph-dropdown user-dd">
              <div className="ph-user-card">
                <div className="ph-avatar-lg">{initials}</div>
                <div>
                  <div className="ph-uc-name">{userName}</div>
                  <div className="ph-uc-role">{roleLabel[role]}</div>
                </div>
              </div>
              <div className="ph-dd-sep" />
              <button className="ph-dd-item ph-logout" onClick={logout}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Deconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <SmartSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default Navbar
