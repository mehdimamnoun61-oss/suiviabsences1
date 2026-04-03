import { useState, useMemo, useRef, useEffect } from "react"
import { exportToExcel } from "../utils/exportHelpers"
import api from "../utils/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function getNiveau(taux) {
  if (taux >= 30) return { label: "Convocation",   chip: "chip-red"    }
  if (taux >= 20) return { label: "Avertissement", chip: "chip-orange" }
  if (taux >= 10) return { label: "Observation",   chip: "chip-yellow" }
  return              { label: "Normal",          chip: "chip-green"  }
}

function RapportClasse() {
  const [selectedId, setSelectedId] = useState("")
  const [query, setQuery]           = useState("")
  const [open, setOpen]             = useState(false)
  const [activeTab, setActiveTab]   = useState("etudiants")
  const searchRef                   = useRef(null)

  const [classes,      setClasses]      = useState([])
  const [etudiants,    setEtudiants]    = useState([])
  const [absences,     setAbsences]     = useState([])
  const [seances,      setSeances]      = useState([])
  const [affectations, setAffectations] = useState([])
  const [modules,      setModules]      = useState([])

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"), api.get("/absences"),
      api.get("/seances"), api.get("/affectations"), api.get("/modules"),
    ]).then(([c, e, a, s, af, m]) => {
      setClasses(c.data); setEtudiants(e.data); setAbsences(a.data)
      setSeances(s.data); setAffectations(af.data); setModules(m.data)
    })
  }, [])

  const classe = classes.find(c => String(c.id) === String(selectedId))

  const suggestions = useMemo(() => {
    if (!query.trim()) return classes.slice(0, 8)
    const q = query.toLowerCase()
    return classes.filter(c =>
      `${c.nom_classe} ${c.filiere} ${c.niveau} ${c.groupe}`.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [query, classes])

  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSelect = (c) => { setSelectedId(String(c.id)); setQuery(c.nom_classe); setOpen(false) }
  const handleClear  = () => { setSelectedId(""); setQuery(""); setOpen(false) }

  const etusClasse = useMemo(() =>
    etudiants.filter(e => String(e.classe_id) === String(selectedId)),
    [etudiants, selectedId]
  )

  const affClasse = useMemo(() =>
    affectations.filter(a => String(a.classe_id) === String(selectedId)),
    [affectations, selectedId]
  )

  const seancesClasse = useMemo(() =>
    seances.filter(s => affClasse.some(a => String(a.id) === String(s.affectation_id))),
    [seances, affClasse]
  )

  const rapportParEtudiant = useMemo(() => {
    if (!classe) return []
    const total = seancesClasse.length || 1
    return etusClasse.map(e => {
      const nbAbsent  = absences.filter(a => String(a.etudiant_id) === String(e.id) && a.statut === "Absent").length
      const nbRetard  = absences.filter(a => String(a.etudiant_id) === String(e.id) && a.statut === "Retard").length
      const taux      = Math.round(((nbAbsent + nbRetard * 0.5) / total) * 1000) / 10
      return { id: e.id, nom: e.nom, prenom: e.prenom, email: e.email, nbAbsent, nbRetard, taux, niveau: getNiveau(taux) }
    }).sort((a, b) => b.taux - a.taux)
  }, [classe, etusClasse, seancesClasse, absences])

  const rapportParModule = useMemo(() => {
    if (!classe) return []
    return affClasse.map(aff => {
      const module = modules.find(m => String(m.id) === String(aff.module_id))
      if (!module) return null
      const seancesMod   = seances.filter(s => String(s.affectation_id) === String(aff.id))
      const totalSeances = seancesMod.length || 1
      const idsSeances   = seancesMod.map(s => String(s.id))
      const nbAbsTot  = absences.filter(a => idsSeances.includes(String(a.seance_id)) && a.statut === "Absent").length
      const nbRetTot  = absences.filter(a => idsSeances.includes(String(a.seance_id)) && a.statut === "Retard").length
      const tauxMoyen = Math.round(((nbAbsTot + nbRetTot * 0.5) / (totalSeances * (etusClasse.length || 1))) * 1000) / 10
      const etusDetail = etusClasse.map(e => {
        const nbAbs = absences.filter(a => String(a.etudiant_id) === String(e.id) && idsSeances.includes(String(a.seance_id)) && a.statut === "Absent").length
        const nbRet = absences.filter(a => String(a.etudiant_id) === String(e.id) && idsSeances.includes(String(a.seance_id)) && a.statut === "Retard").length
        const taux  = Math.round(((nbAbs + nbRet * 0.5) / totalSeances) * 1000) / 10
        return { id: e.id, nom: e.nom, prenom: e.prenom, nbAbs, nbRet, taux, niveau: getNiveau(taux) }
      }).sort((a, b) => b.taux - a.taux)
      return { module: module.nom_module, volume_horaire: module.volume_horaire, totalSeances, nbAbsTot, nbRetTot, tauxMoyen, etusDetail }
    }).filter(Boolean)
  }, [classe, affClasse, modules, seances, absences, etusClasse])

  const statsClasse = useMemo(() => {
    if (!rapportParEtudiant.length) return null
    const conv  = rapportParEtudiant.filter(e => e.taux >= 30).length
    const avert = rapportParEtudiant.filter(e => e.taux >= 20 && e.taux < 30).length
    const obs   = rapportParEtudiant.filter(e => e.taux >= 10 && e.taux < 20).length
    const norm  = rapportParEtudiant.filter(e => e.taux < 10).length
    const tauxMoyen = Math.round(rapportParEtudiant.reduce((s, e) => s + e.taux, 0) / (rapportParEtudiant.length || 1) * 10) / 10
    return { conv, avert, obs, norm, tauxMoyen, niveau: getNiveau(tauxMoyen) }
  }, [rapportParEtudiant])

  const handleExportExcel = () => {
    const rows = rapportParEtudiant.map(e => ({
      Nom: e.nom, Prenom: e.prenom, Email: e.email,
      Absences: e.nbAbsent, Retards: e.nbRetard,
      "Taux (%)": e.taux, Niveau: e.niveau.label,
    }))
    exportToExcel(rows, `rapport_classe_${classe.nom_classe}.xlsx`, "Rapport Classe")
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const today = new Date().toLocaleDateString("fr-MA", { day: "2-digit", month: "long", year: "numeric" })
    doc.setFillColor(15, 23, 42); doc.rect(0, 0, 210, 32, "F")
    doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold")
    doc.text("AbsencePro - Rapport de classe", 14, 14)
    doc.setFontSize(10); doc.setFont("helvetica", "normal")
    doc.text(`Classe : ${classe.nom_classe} - Filiere : ${classe.filiere} - ${today}`, 14, 24)
    doc.setTextColor(55, 65, 81); doc.setFontSize(11); doc.setFont("helvetica", "bold")
    doc.text("Resume par etudiant", 14, 44)
    autoTable(doc, {
      startY: 48,
      head: [["Nom", "Prenom", "Absences", "Retards", "Taux (%)", "Niveau"]],
      body: rapportParEtudiant.map(e => [e.nom, e.prenom, e.nbAbsent, e.nbRetard, `${e.taux}%`, e.niveau.label]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const val = data.cell.raw
          data.cell.styles.textColor =
            val === "Convocation" ? [220, 38, 38] :
            val === "Avertissement" ? [249, 115, 22] :
            val === "Observation" ? [245, 158, 11] : [34, 197, 94]
        }
      }
    })
    doc.save(`rapport_classe_${classe.nom_classe}.pdf`)
  }

  return (
    <div className="container-fluid">
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-title">Rapport par classe</div>
          <div className="page-description">Vue complete des absences par etudiant et par module</div>
        </div>
        <div className="page-badge">Rapport classe</div>
      </div>

      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="form-section-title">Rechercher une classe</div>
          <div className="row align-items-start gap-3 flex-wrap">
            <div className="col-md-4" ref={searchRef} style={{ position: "relative" }}>
              <input type="text" className="form-control" placeholder="Nom, filiere, niveau..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); if (!e.target.value) handleClear() }}
                onFocus={() => setOpen(true)} />
              {open && suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, overflow: "hidden" }}>
                  {suggestions.map(c => {
                    const etusC = etudiants.filter(e => String(e.classe_id) === String(c.id))
                    const affC  = affectations.filter(a => String(a.classe_id) === String(c.id))
                    const seancesC = seances.filter(s => affC.some(a => String(a.id) === String(s.affectation_id)))
                    const nbAbs = absences.filter(a => etusC.some(e => String(e.id) === String(a.etudiant_id)) && a.statut === "Absent").length
                    const isSel = String(c.id) === String(selectedId)
                    return (
                      <div key={c.id} onClick={() => handleSelect(c)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", background: isSel ? "#eff6ff" : "white", borderBottom: "1px solid #f3f4f6" }}
                        onMouseEnter={ev => { if (!isSel) ev.currentTarget.style.background = "#f8fafc" }}
                        onMouseLeave={ev => { if (!isSel) ev.currentTarget.style.background = isSel ? "#eff6ff" : "white" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: isSel ? "#2563eb" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: isSel ? "white" : "#374151", fontWeight: 700, fontSize: 13 }}>
                          {c.nom_classe.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{c.nom_classe}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>{c.filiere} - {c.niveau} - {etusC.length} etudiants - {seancesC.length} seances</div>
                        </div>
                        <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 600 }}>{nbAbs} abs</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {classe && statsClasse && (
              <div className="col d-flex align-items-center gap-3 flex-wrap">
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 14px", border: "1px solid #e5e7eb", display: "flex", gap: 16, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{classe.nom_classe}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{classe.filiere} - {etusClasse.length} etudiants</div>
                  </div>
                  <div style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: statsClasse.tauxMoyen >= 30 ? "#dc2626" : statsClasse.tauxMoyen >= 20 ? "#f97316" : statsClasse.tauxMoyen >= 10 ? "#f59e0b" : "#22c55e" }}>
                      {statsClasse.tauxMoyen}% moy.
                    </div>
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

      {classe && statsClasse ? (
        <>
          <div className="row g-3 mb-4">
            {[
              { label: "Convocation 30%+",   val: statsClasse.conv,  bg: "#fee2e2", col: "#dc2626" },
              { label: "Avertissement 20%+", val: statsClasse.avert, bg: "#ffedd5", col: "#f97316" },
              { label: "Observation 10%+",   val: statsClasse.obs,   bg: "#fef3c7", col: "#f59e0b" },
              { label: "Normal <10%",         val: statsClasse.norm,  bg: "#dcfce7", col: "#16a34a" },
            ].map((s, i) => (
              <div className="col-md-3 col-sm-6" key={i}>
                <div className="card content-card h-100">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <div className="stats-label">{s.label}</div>
                      <div className="stats-value" style={{ color: s.col }}>{s.val}</div>
                    </div>
                    <div className="stats-icon" style={{ background: s.bg, color: s.col, fontSize: 18, fontWeight: 700 }}>
                      {s.val}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card content-card mb-4">
            <div className="card-body">
              <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e5e7eb", paddingBottom: 12 }}>
                {[{ key: "etudiants", label: "Par etudiant" }, { key: "modules", label: "Par module" }].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    style={{ padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeTab === tab.key ? "#2563eb" : "#f3f4f6", color: activeTab === tab.key ? "white" : "#374151" }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "etudiants" && (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead><tr><th>Etudiant</th><th>Absences</th><th>Retards</th><th>Taux</th><th>Niveau</th></tr></thead>
                    <tbody>
                      {rapportParEtudiant.map(e => (
                        <tr key={e.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
                                {e.nom[0]}{e.prenom[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.nom} {e.prenom}</div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{e.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="value-chip chip-red">{e.nbAbsent}</span></td>
                          <td><span className="value-chip chip-orange">{e.nbRetard}</span></td>
                          <td>
                            <div style={{ minWidth: 100 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, color: e.taux >= 30 ? "#dc2626" : e.taux >= 20 ? "#f97316" : e.taux >= 10 ? "#f59e0b" : "#22c55e" }}>{e.taux}%</div>
                              <div style={{ height: 5, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.min(e.taux, 100)}%`, borderRadius: 3, background: e.taux >= 30 ? "#dc2626" : e.taux >= 20 ? "#f97316" : e.taux >= 10 ? "#f59e0b" : "#22c55e" }} />
                              </div>
                            </div>
                          </td>
                          <td><span className={`value-chip ${e.niveau.chip}`}>{e.niveau.label}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "modules" && (
                <div>
                  {rapportParModule.map((r, i) => (
                    <div key={i} style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <span className="value-chip chip-orange" style={{ fontSize: 14 }}>{r.module}</span>
                          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 10 }}>{r.volume_horaire}h - {r.totalSeances} seances</span>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: "#6b7280" }}>{r.nbAbsTot} abs - {r.nbRetTot} ret</span>
                          <div style={{ fontSize: 16, fontWeight: 700, color: r.tauxMoyen >= 30 ? "#dc2626" : r.tauxMoyen >= 20 ? "#f97316" : r.tauxMoyen >= 10 ? "#f59e0b" : "#22c55e" }}>
                            {r.tauxMoyen}% moy.
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table align-middle" style={{ fontSize: 13 }}>
                          <thead><tr><th>Etudiant</th><th>Absences</th><th>Retards</th><th>Taux</th><th>Niveau</th></tr></thead>
                          <tbody>
                            {r.etusDetail.map(e => (
                              <tr key={e.id}>
                                <td style={{ fontWeight: 600 }}>{e.nom} {e.prenom}</td>
                                <td><span className="value-chip chip-red" style={{ fontSize: 11 }}>{e.nbAbs}</span></td>
                                <td><span className="value-chip chip-orange" style={{ fontSize: 11 }}>{e.nbRet}</span></td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 60, height: 5, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                                      <div style={{ height: "100%", width: `${Math.min(e.taux, 100)}%`, background: e.taux >= 30 ? "#dc2626" : e.taux >= 20 ? "#f97316" : e.taux >= 10 ? "#f59e0b" : "#22c55e" }} />
                                    </div>
                                    <span style={{ fontWeight: 700, color: e.taux >= 30 ? "#dc2626" : e.taux >= 20 ? "#f97316" : e.taux >= 10 ? "#f59e0b" : "#22c55e" }}>{e.taux}%</span>
                                  </div>
                                </td>
                                <td><span className={`value-chip ${e.niveau.chip}`} style={{ fontSize: 11 }}>{e.niveau.label}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {i < rapportParModule.length - 1 && <hr style={{ borderColor: "#f3f4f6" }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : selectedId ? (
        <div className="card content-card"><div className="empty-box">Aucune donnee pour cette classe.</div></div>
      ) : (
        <div className="card content-card"><div className="empty-box" style={{ padding: 48 }}>Tapez un nom de classe pour afficher son rapport complet</div></div>
      )}
    </div>
  )
}

export default RapportClasse
