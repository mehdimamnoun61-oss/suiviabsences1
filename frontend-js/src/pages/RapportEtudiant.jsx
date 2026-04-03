import { useState, useMemo, useRef, useEffect } from "react"
import { exportToExcel } from "../utils/exportHelpers"
import api from "../utils/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function getNiveau(taux) {
  if (taux >= 30) return { label: "Convocation",    chip: "chip-red"    }
  if (taux >= 20) return { label: "Avertissement",  chip: "chip-orange" }
  if (taux >= 10) return { label: "Observation",    chip: "chip-yellow" }
  return              { label: "Normal",           chip: "chip-green"  }
}

function RapportEtudiant() {
  const [selectedId, setSelectedId] = useState("")
  const [query, setQuery]           = useState("")
  const [open, setOpen]             = useState(false)
  const searchRef                   = useRef(null)

  const [etudiants,    setEtudiants]    = useState([])
  const [absences,     setAbsences]     = useState([])
  const [seances,      setSeances]      = useState([])
  const [affectations, setAffectations] = useState([])
  const [modules,      setModules]      = useState([])
  const [classes,      setClasses]      = useState([])

  useEffect(() => {
    Promise.all([
      api.get("/etudiants"), api.get("/absences"), api.get("/seances"),
      api.get("/affectations"), api.get("/modules"), api.get("/classes"),
    ]).then(([e, a, s, af, m, c]) => {
      setEtudiants(e.data); setAbsences(a.data); setSeances(s.data)
      setAffectations(af.data); setModules(m.data); setClasses(c.data)
    })
  }, [])

  const etudiant = etudiants.find(e => String(e.id) === String(selectedId))
  const getClasseNom = (id) => { const c = classes.find(c => String(c.id) === String(id)); return c ? c.nom_classe : "" }

  const suggestions = useMemo(() => {
    if (!query.trim()) return etudiants.slice(0, 8)
    const q = query.toLowerCase()
    return etudiants.filter(e =>
      `${e.nom} ${e.prenom} ${e.email} ${getClasseNom(e.classe_id)}`.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query, etudiants, classes])

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (e) => { setSelectedId(String(e.id)); setQuery(`${e.nom} ${e.prenom}`); setOpen(false) }
  const handleClear  = () => { setSelectedId(""); setQuery(""); setOpen(false) }

  const rapport = useMemo(() => {
    if (!etudiant) return []
    const affClasse = affectations.filter(a => String(a.classe_id) === String(etudiant.classe_id))
    return affClasse.map(aff => {
      const module = modules.find(m => String(m.id) === String(aff.module_id))
      if (!module) return null
      const seancesMod  = seances.filter(s => String(s.affectation_id) === String(aff.id))
      const totalSeances = seancesMod.length || 1
      const idsSeances   = seancesMod.map(s => String(s.id))
      const absencesMod  = absences.filter(a => String(a.etudiant_id) === String(etudiant.id) && idsSeances.includes(String(a.seance_id)))
      const nbAbsent   = absencesMod.filter(a => a.statut === "Absent").length
      const nbRetard   = absencesMod.filter(a => a.statut === "Retard").length
      const nbJustifie = absencesMod.filter(a => a.justifie).length
      const heuresAbs  = nbAbsent * (module.volume_horaire / totalSeances)
      const heuresRet  = nbRetard * (module.volume_horaire / totalSeances) * 0.5
      const taux       = Math.round(((heuresAbs + heuresRet) / module.volume_horaire) * 1000) / 10
      const detail     = seancesMod.map(s => {
        const abs = absencesMod.find(a => String(a.seance_id) === String(s.id))
        return { id: s.id, date: s.date_seance, heure: `${s.heure_debut} - ${s.heure_fin}`, statut: abs ? abs.statut : "Present", justifie: abs ? (abs.justifie ? "Oui" : "Non") : "-" }
      }).sort((a, b) => a.date.localeCompare(b.date))
      return { module: module.nom_module, volume_horaire: module.volume_horaire, totalSeances, nbAbsent, nbRetard, nbJustifie, taux, niveau: getNiveau(taux), detail }
    }).filter(Boolean)
  }, [etudiant, affectations, modules, seances, absences])

  const globalStats = useMemo(() => {
    if (!rapport.length) return null
    const totalH    = rapport.reduce((s, r) => s + r.volume_horaire, 0)
    const absH      = rapport.reduce((s, r) => s + r.nbAbsent * (r.volume_horaire / (r.totalSeances || 1)), 0)
    const retH      = rapport.reduce((s, r) => s + r.nbRetard * (r.volume_horaire / (r.totalSeances || 1)) * 0.5, 0)
    const tauxGlobal = Math.round(((absH + retH) / (totalH || 1)) * 1000) / 10
    return { totalAbsent: rapport.reduce((s, r) => s + r.nbAbsent, 0), totalRetard: rapport.reduce((s, r) => s + r.nbRetard, 0), totalSeances: rapport.reduce((s, r) => s + r.totalSeances, 0), tauxGlobal, niveau: getNiveau(tauxGlobal) }
  }, [rapport])

  const handleExportExcel = () => {
    const rows = []
    rapport.forEach(r => {
      r.detail.forEach(d => rows.push({ Module: r.module, Date: d.date, Horaire: d.heure, Statut: d.statut, Justifie: d.justifie }))
      rows.push({ Module: `Taux ${r.module}`, Date: "", Horaire: "", Statut: "", Justifie: `${r.taux}% (${r.niveau.label})` })
      rows.push({})
    })
    exportToExcel(rows, `rapport_${etudiant.nom}_${etudiant.prenom}.xlsx`, "Rapport")
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const today = new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" })
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 32, "F")
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold")
    doc.text("AbsencePro - Rapport individuel", 14, 14)
    doc.setFontSize(10); doc.setFont("helvetica", "normal")
    doc.text(`Etudiant : ${etudiant.nom} ${etudiant.prenom} | Classe : ${getClasseNom(etudiant.classe_id)} | ${today}`, 14, 24)
    if (globalStats) {
      doc.setTextColor(55, 65, 81); doc.setFontSize(11); doc.setFont("helvetica", "bold")
      doc.text(`Taux global : ${globalStats.tauxGlobal}% - ${globalStats.niveau.label}`, 14, 42)
    }
    autoTable(doc, {
      startY: 48,
      head: [["Module", "Volume h.", "Seances", "Absences", "Retards", "Taux", "Niveau"]],
      body: rapport.map(r => [r.module, `${r.volume_horaire}h`, r.totalSeances, r.nbAbsent, r.nbRetard, `${r.taux}%`, r.niveau.label]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235] },
    })
    doc.save(`rapport_${etudiant.nom}_${etudiant.prenom}.pdf`)
  }

  return (
    <div className="container-fluid">
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-title">Rapport par etudiant</div>
          <div className="page-description">Detail des absences par module avec taux pour chaque etudiant</div>
        </div>
        <div className="page-badge">Rapport individuel</div>
      </div>

      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="form-section-title">Rechercher un etudiant</div>
          <div className="row align-items-start gap-3 flex-wrap">
            <div className="col-md-5" ref={searchRef} style={{ position: "relative" }}>
              <input type="text" className="form-control" placeholder="Nom, prenom, email ou classe..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) handleClear() }}
                onFocus={() => setOpen(true)} />
              {open && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, overflow: "hidden" }}>
                  {suggestions.map(e => {
                    const affC = affectations.filter(a => String(a.classe_id) === String(e.classe_id))
                    const seancesC = seances.filter(s => affC.some(a => String(a.id) === String(s.affectation_id)))
                    const total = seancesC.length || 1
                    const nbAbs = absences.filter(a => String(a.etudiant_id) === String(e.id) && a.statut === "Absent").length
                    const nbRet = absences.filter(a => String(a.etudiant_id) === String(e.id) && a.statut === "Retard").length
                    const taux  = Math.round(((nbAbs + nbRet * 0.5) / total) * 1000) / 10
                    const niv   = getNiveau(taux)
                    const isSel = String(e.id) === String(selectedId)
                    return (
                      <div key={e.id} onClick={() => handleSelect(e)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", background: isSel ? "#eff6ff" : "white", borderBottom: "1px solid #f3f4f6" }}
                        onMouseEnter={ev => { if (!isSel) ev.currentTarget.style.background = "#f8fafc" }}
                        onMouseLeave={ev => { if (!isSel) ev.currentTarget.style.background = "white" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isSel ? "#2563eb" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: isSel ? "white" : "#374151", fontSize: 13, fontWeight: 700 }}>
                          {e.nom[0]}{e.prenom[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{e.nom} {e.prenom}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{getClasseNom(e.classe_id)} - {e.email}</div>
                        </div>
                        <span className={`value-chip ${niv.chip}`} style={{ fontSize: 11 }}>{taux}% {niv.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {etudiant && globalStats && (
              <div className="col d-flex align-items-center gap-3 flex-wrap">
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 14px", border: "1px solid #e5e7eb", display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                    {etudiant.nom[0]}{etudiant.prenom[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{etudiant.nom} {etudiant.prenom}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{getClasseNom(etudiant.classe_id)}</div>
                  </div>
                  <div style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: globalStats.tauxGlobal >= 30 ? "#dc2626" : globalStats.tauxGlobal >= 20 ? "#f97316" : globalStats.tauxGlobal >= 10 ? "#f59e0b" : "#22c55e" }}>
                      {globalStats.tauxGlobal}%
                    </div>
                    <span className={`value-chip ${globalStats.niveau.chip}`} style={{ fontSize: 11 }}>{globalStats.niveau.label}</span>
                  </div>
                </div>
                <button className="btn btn-success btn-sm" onClick={handleExportExcel}>Export Excel</button>
                <button className="btn btn-danger btn-sm" onClick={handleExportPDF}>Export PDF</button>
                <button className="btn btn-secondary btn-sm" onClick={handleClear}>Changer</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {etudiant && globalStats ? (
        <>
          <div className="card content-card mb-4">
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                <span>Taux global d'absence</span>
                <span>{globalStats.totalAbsent} abs - {globalStats.totalRetard} ret - {globalStats.totalSeances} seances</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, width: `${Math.min(globalStats.tauxGlobal, 100)}%`, background: globalStats.tauxGlobal >= 30 ? "#dc2626" : globalStats.tauxGlobal >= 20 ? "#f97316" : globalStats.tauxGlobal >= 10 ? "#f59e0b" : "#22c55e", transition: "width 0.6s ease" }} />
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
                <span style={{ color: "#f59e0b" }}>10% Observation</span>
                <span style={{ color: "#f97316" }}>20% Avertissement</span>
                <span style={{ color: "#dc2626" }}>30% Convocation</span>
              </div>
            </div>
          </div>

          {rapport.map((r, i) => (
            <div className="card content-card mb-4" key={i}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <span className="value-chip chip-orange" style={{ fontSize: 14 }}>{r.module}</span>
                    <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 10 }}>{r.volume_horaire}h - {r.totalSeances} seances</span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{r.nbAbsent} abs - {r.nbRetard} ret - {r.nbJustifie} just.</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: r.taux >= 30 ? "#dc2626" : r.taux >= 20 ? "#f97316" : r.taux >= 10 ? "#f59e0b" : "#22c55e" }}>{r.taux}%</div>
                      <span className={`value-chip ${r.niveau.chip}`} style={{ fontSize: 11 }}>{r.niveau.label}</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", marginBottom: 16, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(r.taux, 100)}%`, background: r.taux >= 30 ? "#dc2626" : r.taux >= 20 ? "#f97316" : r.taux >= 10 ? "#f59e0b" : "#22c55e" }} />
                </div>
                {r.detail.length === 0 ? <div className="empty-box">Aucune seance.</div> : (
                  <div className="table-responsive">
                    <table className="table align-middle" style={{ fontSize: 13 }}>
                      <thead><tr><th>Date</th><th>Horaire</th><th>Statut</th><th>Justifie</th></tr></thead>
                      <tbody>
                        {r.detail.map(d => (
                          <tr key={d.id}>
                            <td>{d.date}</td><td style={{ color: "#6b7280" }}>{d.heure}</td>
                            <td><span className={`value-chip ${d.statut === "Absent" ? "chip-red" : d.statut === "Retard" ? "chip-orange" : "chip-green"}`}>{d.statut}</span></td>
                            <td>{d.justifie === "-" ? <span style={{ color: "#9ca3af" }}>-</span> : <span className={`value-chip ${d.justifie === "Oui" ? "chip-green" : "chip-red"}`}>{d.justifie}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      ) : selectedId ? (
        <div className="card content-card"><div className="empty-box">Aucune donnee pour cet etudiant.</div></div>
      ) : (
        <div className="card content-card"><div className="empty-box" style={{ padding: 48 }}>Tapez un nom pour rechercher un etudiant</div></div>
      )}
    </div>
  )
}

export default RapportEtudiant
