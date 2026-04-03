import { NavLink, useNavigate } from "react-router-dom"
import api from "../utils/api"

const ICONS = {
  "/":                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  "/classes":          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "/etudiants":        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  "/modules":          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  "/enseignants":      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/><path d="M12 12v9"/><path d="M9 18l3 3 3-3"/></svg>,
  "/affectations":     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>,
  "/saisie-absences":  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  "/absences":         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  "/avertissements":   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  "/mes-etudiants":    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  "/rapport-etudiant": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  "/rapport-classe":   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  "/feuille-presence": <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
}

const navByRole = {
  admin: [
    { to: "/",                label: "Dashboard"       },
    { to: "/classes",         label: "Classes"         },
    { to: "/etudiants",       label: "Etudiants"       },
    { to: "/modules",         label: "Modules"         },
    { to: "/enseignants",     label: "Enseignants"     },
    { to: "/affectations",    label: "Affectations"    },
    { to: "/saisie-absences", label: "Saisie absences" },
    { to: "/absences",        label: "Absences"        },
    { to: "/avertissements",  label: "Avertissements"  },
  ],
  enseignant: [
    { to: "/",                label: "Dashboard"       },
    { to: "/mes-etudiants",   label: "Mes etudiants"   },
    { to: "/saisie-absences", label: "Saisie absences" },
  ],
  administration: [
    { to: "/",                label: "Dashboard"       },
    { to: "/classes",         label: "Classes"         },
    { to: "/etudiants",       label: "Etudiants"       },
    { to: "/absences",        label: "Absences"        },
    { to: "/avertissements",  label: "Avertissements"  },
    { to: "/feuille-presence",label: "Feuille presence"},
  ],
}

const rapportItems = [
  { to: "/rapport-etudiant", label: "Rapport etudiant"  },
  { to: "/rapport-classe",   label: "Rapport classe"    },
  { to: "/feuille-presence", label: "Feuille presence"  },
]

function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const role     = localStorage.getItem("role") || "administration"
  const userName = localStorage.getItem("userName") || "Utilisateur"
  const navItems = navByRole[role] || navByRole.administration

  const logout = () => {
    api.post("/logout").catch(() => {})
    localStorage.removeItem("token")
    localStorage.removeItem("isAuth")
    localStorage.removeItem("role")
    localStorage.removeItem("userName")
    navigate("/login")
  }

  const roleLabel = {
    admin: "Administrateur",
    enseignant: "Enseignant",
    administration: "Administration Pedagogique"
  }

  const initials = userName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <aside className={`sidebar-custom ${open ? "sidebar-open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img
            src="/logo.jpg.jpeg"
            alt="Logo"
            style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          />
          <div className="sidebar-logo-text">
            <span className="logo-line1">Ecole Polytechnique</span>
            <span className="logo-line2">Des Genies</span>
          </div>
        </div>
        <div className="sidebar-appname">AbsencePro</div>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div>
          <div className="sidebar-user-name">{userName}</div>
          <div className="sidebar-user-role">{roleLabel[role]}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section-title">Navigation</div>
      <nav className="nav flex-column">
        {navItems.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <span className="sidebar-link-icon">{ICONS[to]}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Rapports */}
      <div className="sidebar-section-title">Rapports</div>
      <nav className="nav flex-column">
        {rapportItems.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
            <span className="sidebar-link-icon">{ICONS[to]}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Deconnexion
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
