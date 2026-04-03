import { useEffect, useState, useMemo } from "react"
import api from "../utils/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]

function getWeekDays(startDate) {
  // Returns all weekdays (Mon-Fri) from startDate for 4 weeks
  const days = []
  const start = new Date(startDate)
  // Go to Monday of that week
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)

  for (let w = 0; w < 4; w++) {
    for (let d = 0; d < 5; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      days.push(date.toISOString().slice(0, 10))
    }
  }
  return days
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

function FeuillePresence() {
  const [classes,      setClasses]      = useState([])
  const [etudiants,    setEtudiants]    = useState([])
  const [seances,      setSeances]      = useState([])
  const [absences,     setAbsences]     = useState([])
  const [affectations, setAffectations] = useState([])

  const [classeId,   setClasseId]   = useState("")
  const [startDate,  setStartDate]  = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [filterNiveau,  setFilterNiveau]  = useState("")
  const [filterFiliere, setFilterFiliere] = useState("")
  const [filterAnnee,   setFilterAnnee]   = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"),
      api.get("/seances"), api.get("/absences"), api.get("/affectations"),
    ]).then(([c, e, s, ab, af]) => {
      setClasses(c.data); setEtudiants(e.data)
      setSeances(s.data); setAbsences(ab.data); setAffectations(af.data)
    }).finally(() => setLoading(false))
  }, [])

  const classe    = classes.find(c => String(c.id) === String(classeId))

  // Unique filter values
  const niveaux  = [...new Set(classes.map(c => c.niveau))].filter(Boolean)
  const filieres = [...new Set(classes.filter(c => !filterNiveau || c.niveau === filterNiveau).map(c => c.filiere))].filter(Boolean)
  const annees   = [...new Set(classes.map(c => c.annee_scolaire))].filter(Boolean)

  const classesFiltrees = useMemo(() =>
    classes.filter(c =>
      (!filterNiveau  || c.niveau         === filterNiveau)  &&
      (!filterFiliere || c.filiere        === filterFiliere) &&
      (!filterAnnee   || c.annee_scolaire === filterAnnee)
    ),
    [classes, filterNiveau, filterFiliere, filterAnnee]
  )
  const etusClasse = useMemo(() =>
    etudiants.filter(e => String(e.classe_id) === String(classeId)),
    [etudiants, classeId]
  )

  const weekDays = useMemo(() => getWeekDays(startDate), [startDate])

  // For each etudiant + each day: get statut
  const getStatut = useMemo(() => {
    // Build a map: etudiant_id -> date -> statut
    const map = {}
    absences.forEach(ab => {
      const seance = seances.find(s => String(s.id) === String(ab.seance_id))
      if (!seance) return
      const aff = affectations.find(a => String(a.id) === String(seance.affectation_id))
      if (!aff || String(aff.classe_id) !== String(classeId)) return
      const date = seance.date_seance
      if (!map[ab.etudiant_id]) map[ab.etudiant_id] = {}
      // If multiple seances same day, worst statut wins
      const existing = map[ab.etudiant_id][date]
      const priority = { "Absent": 3, "Retard": 2, "Present": 1 }
      if (!existing || (priority[ab.statut] || 0) > (priority[existing] || 0)) {
        map[ab.etudiant_id][date] = ab.statut
      }
    })
    return (etudiantId, date) => map[etudiantId]?.[date] || null
  }, [absences, seances, affectations, classeId])

  const statutStyle = (statut) => {
    if (statut === "Absent")  return { color: "#dc2626", fontWeight: 700 }
    if (statut === "Retard")  return { color: "#f97316", fontWeight: 700 }
    if (statut === "Present") return { color: "#16a34a", fontWeight: 700 }
    return { color: "#d1d5db" }
  }

  const statutLabel = (statut) => {
    if (statut === "Absent")  return "A"
    if (statut === "Retard")  return "R"
    if (statut === "Present") return "P"
    return "-"
  }

  // Group days by week
  const weeks = [0, 1, 2, 3].map(w => weekDays.slice(w * 5, w * 5 + 5))

  const endDate = weekDays[weekDays.length - 1]

  // ── Export PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" })
    const pageW = 420
    const margin = 14

    // ── Header blanc ────────────────────────────────────────────────────
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42)
    doc.text("Ecole Polytechnique des Genies", margin, 10)
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80)
    doc.text("Etablissement Prive  |  22 RUE MOHAMMED HAYANI V.N IMB HAZZAZ ETAGE 4 APP 20", margin, 15)
    doc.text("Autorise Sous Le N: 5/01/2/2020  |  En Date Du 2020/07/22", margin, 19)

    // Titre centré
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42)
    doc.text("Suivi de presence", pageW / 2, 28, { align: "center" })
    doc.setLineWidth(0.4); doc.setDrawColor(15, 23, 42)
    doc.line(pageW / 2 - 35, 30, pageW / 2 + 35, 30)

    // Info classe (2 colonnes)
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(55, 65, 81)
    doc.setFont("helvetica", "bold"); doc.text("Niveau :", margin, 38)
    doc.setFont("helvetica", "normal"); doc.text(classe?.niveau || "", margin + 20, 38)
    doc.setFont("helvetica", "bold"); doc.text("Annee de Formation :", pageW / 2 + 10, 38)
    doc.setFont("helvetica", "normal"); doc.text(classe?.annee_scolaire || "", pageW / 2 + 55, 38)
    doc.setFont("helvetica", "bold"); doc.text("Filiere :", margin, 44)
    doc.setFont("helvetica", "normal"); doc.text(classe?.filiere || "", margin + 20, 44)
    doc.setFont("helvetica", "bold"); doc.text("Du", pageW / 2 + 10, 44)
    doc.setFont("helvetica", "normal"); doc.text(`${startDate} au ${endDate}`, pageW / 2 + 18, 44)

    // Ligne séparatrice
    doc.setDrawColor(180, 180, 180)
    doc.line(margin, 48, pageW - margin, 48)

    // ── Table ────────────────────────────────────────────────────────────
    const semHeaders = weeks.map((_, i) => ({
      content: `Semaine ${i + 1}`, colSpan: 5,
      styles: { halign: "center", fillColor: [230, 236, 245], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 }
    }))
    const dayHeaders = weeks.flatMap(w => w.map(d => ({
      content: `${JOURS[new Date(d).getDay() - 1]}\n${formatDate(d)}`,
      styles: { halign: "center", fontSize: 7, fillColor: [245, 247, 250] }
    })))

    const head = [
      [
        { content: "N", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [230, 236, 245] } },
        { content: "NOM ET PRENOM", rowSpan: 2, styles: { valign: "middle", fillColor: [230, 236, 245] } },
        ...semHeaders,
        { content: "Total", colSpan: 3, styles: { halign: "center", fillColor: [254, 243, 199], textColor: [15, 23, 42], fontStyle: "bold", fontSize: 9 } }
      ],
      [
        ...dayHeaders,
        { content: "Abs", styles: { halign: "center", textColor: [220, 38, 38], fillColor: [254, 226, 226], fontStyle: "bold", fontSize: 8 } },
        { content: "Ret", styles: { halign: "center", textColor: [249, 115, 22], fillColor: [255, 237, 213], fontStyle: "bold", fontSize: 8 } },
        { content: "Pre", styles: { halign: "center", textColor: [22, 163, 74],  fillColor: [220, 252, 231], fontStyle: "bold", fontSize: 8 } },
      ],
    ]

    const body = etusClasse.map((e, i) => {
      const seancesIds = seances
        .filter(s => { const aff = affectations.find(a => String(a.id) === String(s.affectation_id)); return aff && String(aff.classe_id) === String(classeId) && weekDays.includes(s.date_seance) })
        .map(s => String(s.id))
      const nbAbs = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Absent").length
      const nbRet = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Retard").length
      const nbPre = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Present").length
      return [
        { content: i + 1, styles: { halign: "center" } },
        `${e.nom} ${e.prenom}`,
        ...weekDays.map(() => ({ content: "", styles: { halign: "center", minCellHeight: 10 } })),
        { content: nbAbs || "", styles: { halign: "center", textColor: [220, 38, 38], fontStyle: "bold" } },
        { content: nbRet || "", styles: { halign: "center", textColor: [249, 115, 22], fontStyle: "bold" } },
        { content: nbPre || "", styles: { halign: "center", textColor: [22, 163, 74],  fontStyle: "bold" } },
      ]
    })

    body.push([{
      content: "Emargement Formateur",
      colSpan: 25,
      styles: { halign: "right", fontStyle: "italic", textColor: [100, 116, 139], fontSize: 8 }
    }])

    autoTable(doc, {
      startY: 52,
      head,
      body,
      styles: { fontSize: 8, cellPadding: 1.5, lineColor: [150, 150, 150], lineWidth: 0.3 },
      headStyles: { lineColor: [150, 150, 150], lineWidth: 0.3 },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 38 } },
      theme: "grid",
      tableLineColor: [150, 150, 150],
      tableLineWidth: 0.3,
    })

    doc.save(`feuille_presence_${classe?.nom_classe || "classe"}_${startDate}.pdf`)
  }

  // ── Export Excel ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const rows = []
    rows.push(["Ecole Polytechnique des Genies"])
    rows.push([`Classe: ${classe?.nom_classe} | Filiere: ${classe?.filiere} | Annee: ${classe?.annee_scolaire}`])
    rows.push([`Du ${startDate} au ${endDate}`])
    rows.push([])

    const semRow = ["N", "NOM ET PRENOM"]
    weeks.forEach((w, i) => { semRow.push(`Semaine ${i + 1}`); for (let d = 1; d < 5; d++) semRow.push("") })
    rows.push(semRow)

    const dayRow = ["", ""]
    weekDays.forEach(d => dayRow.push(`${JOURS[new Date(d).getDay() - 1]} ${formatDate(d)}`))
    rows.push(dayRow)

    etusClasse.forEach((e, i) => {
      const row = [i + 1, `${e.nom} ${e.prenom}`]
      weekDays.forEach(d => row.push(statutLabel(getStatut(e.id, d))))
      rows.push(row)
    })

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Presence")
    XLSX.writeFile(wb, `feuille_presence_${classe?.nom_classe || "classe"}_${startDate}.xlsx`)
  }

  return (
    <div className="container-fluid">
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-title">Feuille de presence</div>
          <div className="page-description">Suivi hebdomadaire des presences par classe</div>
        </div>
        {classeId && <div className="page-badge">{etusClasse.length} etudiants</div>}
      </div>

      {/* Filtres */}
      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="form-section-title">Parametres</div>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="label-muted">Niveau</label>
              <select className="form-select" value={filterNiveau}
                onChange={e => { setFilterNiveau(e.target.value); setFilterFiliere(""); setClasseId("") }}>
                <option value="">-- Tous les niveaux --</option>
                {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="label-muted">Filiere</label>
              <select className="form-select" value={filterFiliere}
                onChange={e => { setFilterFiliere(e.target.value); setClasseId("") }}
                disabled={!filterNiveau}>
                <option value="">-- Toutes les filieres --</option>
                {filieres.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="label-muted">Annee scolaire</label>
              <select className="form-select" value={filterAnnee}
                onChange={e => { setFilterAnnee(e.target.value); setClasseId("") }}>
                <option value="">-- Toutes --</option>
                {annees.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="label-muted">Classe</label>
              <select className="form-select" value={classeId} onChange={e => setClasseId(e.target.value)}>
                <option value="">Choisir --</option>
                {classesFiltrees.map(c => <option key={c.id} value={c.id}>{c.nom_classe} — Gr.{c.groupe}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="label-muted">Debut periode</label>
              <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            {classeId && (
              <div className="col-12 d-flex gap-2 flex-wrap">
                <button className="btn btn-danger" onClick={handleExportPDF}>Export PDF</button>
                <button className="btn btn-success" onClick={handleExportExcel}>Export Excel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tableau */}
      {classeId && !loading && (
        <div className="card content-card">
          <div className="card-body">
            {/* Info classe */}
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#374151" }}>
              <strong>{classe?.nom_classe}</strong> — {classe?.filiere} — {classe?.niveau} — Groupe {classe?.groupe} — {classe?.annee_scolaire}
              <span style={{ marginLeft: 16, color: "#6b7280" }}>Du {startDate} au {endDate}</span>
            </div>

            <div className="table-responsive">
              <table style={{ fontSize: 11, borderCollapse: "collapse", width: "100%", border: "1px solid #374151" }}>
                <thead>
                  <tr>
                    <th rowSpan={2} style={{ border: "1px solid #374151", textAlign: "center", verticalAlign: "middle", padding: "6px 4px", width: 30, background: "#f1f5f9" }}>N</th>
                    <th rowSpan={2} style={{ border: "1px solid #374151", verticalAlign: "middle", padding: "6px 8px", minWidth: 140, background: "#f1f5f9" }}>NOM ET PRENOM</th>
                    {weeks.map((_, i) => (
                      <th key={i} colSpan={5} style={{ border: "1px solid #374151", textAlign: "center", padding: "6px 4px", background: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>
                        Semaine {i + 1}
                      </th>
                    ))}
                    <th colSpan={3} style={{ border: "1px solid #374151", textAlign: "center", padding: "6px 4px", background: "#fef3c7", fontWeight: 700, fontSize: 12 }}>Total</th>
                  </tr>
                  <tr>
                    {weekDays.map((d) => (
                      <th key={d} style={{ border: "1px solid #374151", textAlign: "center", fontSize: 9, fontWeight: 600, color: "#374151", width: 38, padding: "4px 2px", background: "#f8fafc" }}>
                        {JOURS[new Date(d).getDay() - 1]}<br />
                        <span style={{ fontWeight: 400, color: "#6b7280" }}>{formatDate(d)}</span>
                      </th>
                    ))}
                    <th style={{ border: "1px solid #374151", textAlign: "center", fontSize: 9, fontWeight: 700, color: "#dc2626", background: "#fee2e2", width: 36 }}>Abs</th>
                    <th style={{ border: "1px solid #374151", textAlign: "center", fontSize: 9, fontWeight: 700, color: "#f97316", background: "#ffedd5", width: 36 }}>Ret</th>
                    <th style={{ border: "1px solid #374151", textAlign: "center", fontSize: 9, fontWeight: 700, color: "#16a34a", background: "#dcfce7", width: 36 }}>Pre</th>
                  </tr>
                </thead>
                <tbody>
                  {etusClasse.map((e, i) => {
                    // Count from absences data for this period
                    const seancesIds = seances
                      .filter(s => {
                        const aff = affectations.find(a => String(a.id) === String(s.affectation_id))
                        return aff && String(aff.classe_id) === String(classeId) && weekDays.includes(s.date_seance)
                      }).map(s => String(s.id))
                    const nbAbs = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Absent").length
                    const nbRet = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Retard").length
                    const nbPre = absences.filter(a => String(a.etudiant_id) === String(e.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Present").length
                    return (
                      <tr key={e.id}>
                        <td style={{ border: "1px solid #374151", textAlign: "center", color: "#374151", fontWeight: 600, padding: "4px" }}>{i + 1}</td>
                        <td style={{ border: "1px solid #374151", fontWeight: 600, padding: "4px 8px", fontSize: 12 }}>{e.nom} {e.prenom}</td>
                        {weekDays.map((d) => (
                          <td key={d} style={{ border: "1px solid #374151", textAlign: "center", height: 36, minWidth: 36 }}></td>
                        ))}
                        <td style={{ border: "1px solid #374151", textAlign: "center", fontWeight: 700, color: "#dc2626", background: "#fff5f5", fontSize: 12 }}>{nbAbs || ""}</td>
                        <td style={{ border: "1px solid #374151", textAlign: "center", fontWeight: 700, color: "#f97316", background: "#fffbeb", fontSize: 12 }}>{nbRet || ""}</td>
                        <td style={{ border: "1px solid #374151", textAlign: "center", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", fontSize: 12 }}>{nbPre || ""}</td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td colSpan={22} style={{ border: "1px solid #374151", textAlign: "right", fontSize: 11, color: "#374151", fontStyle: "italic", padding: "8px 12px", fontWeight: 600 }}>
                      Emargement Formateur
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legende */}
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12 }}>
              <span><strong style={{ color: "#16a34a" }}>P</strong> = Present</span>
              <span><strong style={{ color: "#dc2626" }}>A</strong> = Absent</span>
              <span><strong style={{ color: "#f97316" }}>R</strong> = Retard</span>
              <span style={{ color: "#9ca3af" }}>- = Pas de seance</span>
            </div>
          </div>
        </div>
      )}

      {!classeId && !loading && (
        <div className="card content-card"><div className="empty-box" style={{ padding: 48 }}>Choisissez une classe pour afficher la feuille de presence</div></div>
      )}
    </div>
  )
}

export default FeuillePresence
