import { useEffect, useState, useMemo } from "react"
import api from "../utils/api"
import Toast from "../components/Toast"
import { useSearchParams } from "react-router-dom"

function SaisieAbsences() {
  const [classes,      setClasses]      = useState([])
  const [etudiants,    setEtudiants]    = useState([])
  const [affectations, setAffectations] = useState([])
  const [seances,      setSeances]      = useState([])
  const [absences,     setAbsences]     = useState([])
  const [modules,      setModules]      = useState([])

  const [searchParams] = useSearchParams()
  const [classeId,  setClasseId]  = useState(searchParams.get("classe") || "")
  const [groupe,    setGroupe]    = useState("")
  const [date,      setDate]      = useState(searchParams.get("date") || new Date().toISOString().slice(0, 10))
  const [presences, setPresences] = useState({})
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [loading,   setLoading]   = useState(true)
  const [toast,     setToast]     = useState(null) // { message, type }

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"), api.get("/modules"),
      api.get("/affectations"), api.get("/seances"), api.get("/absences"),
    ]).then(([c, e, m, af, s, ab]) => {
      setClasses(c.data); setEtudiants(e.data); setModules(m.data)
      setAffectations(af.data); setSeances(s.data); setAbsences(ab.data)
    }).finally(() => setLoading(false))
  }, [])

  // Groupes available from classes list
  const groupes = useMemo(() => {
    const seen = new Set()
    return classes.filter(c => { if (seen.has(c.groupe)) return false; seen.add(c.groupe); return true })
      .map(c => c.groupe)
  }, [classes])

  // Filter classes by selected groupe
  const classesFiltrees = useMemo(() =>
    groupe ? classes.filter(c => c.groupe === groupe) : classes,
    [classes, groupe]
  )

  // Students of selected classe
  const etusClasse = useMemo(() =>
    etudiants.filter(e => String(e.classe_id) === String(classeId)),
    [etudiants, classeId]
  )

  // Find seance for classe+date (any affectation of that classe)
  const resolvedSeance = useMemo(() => {
    if (!classeId || !date) return null
    const affClasse = affectations.filter(a => String(a.classe_id) === String(classeId))
    return seances.find(s =>
      affClasse.some(a => String(a.id) === String(s.affectation_id)) && s.date_seance === date
    ) || null
  }, [classeId, date, affectations, seances])

  // Pre-fill presences when seance/students change
  useEffect(() => {
    if (!etusClasse.length) return
    const init = {}
    etusClasse.forEach(e => {
      const existing = resolvedSeance
        ? absences.find(a => String(a.etudiant_id) === String(e.id) && String(a.seance_id) === String(resolvedSeance.id))
        : null
      init[e.id] = {
        absent: existing?.statut === "Absent",
        retard: existing?.statut === "Retard",
      }
    })
    setPresences(init)
    setSaved(false)
  }, [resolvedSeance, etusClasse, absences])

  const getStatut = (id) => {
    const p = presences[id]
    if (!p) return "Present"
    if (p.absent) return "Absent"
    if (p.retard) return "Retard"
    return "Present"
  }

  const toggleAbsent = (id) => {
    setPresences(prev => {
      const cur = prev[id] || {}
      return { ...prev, [id]: { absent: !cur.absent, retard: false } }
    })
    setSaved(false)
  }

  const toggleRetard = (id) => {
    setPresences(prev => {
      const cur = prev[id] || {}
      return { ...prev, [id]: { retard: !cur.retard, absent: false } }
    })
    setSaved(false)
  }

  const handleSave = async () => {
    if (!classeId || !date) return
    setSaving(true)
    try {
      // Find first affectation for this classe
      const aff = affectations.find(a => String(a.classe_id) === String(classeId))
      if (!aff) { setToast({ message: "Aucune affectation trouvee pour cette classe.", type: "error" }); setSaving(false); return }

      let seance = resolvedSeance
      if (!seance) {
        try {
          const res = await api.post("/seances", {
            affectation_id: aff.id,
            date_seance:    date,
            heure_debut:    "08:00",
            heure_fin:      "10:00",
            duree:          120,
            statut:         "realisee",
          })
          seance = res.data
          setSeances(prev => [...prev, seance])
        } catch (err) {
          const msg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || "Erreur creation seance"
          alert(msg)
          setSaving(false)
          return
        }      }

      // Save absences
      await Promise.all(etusClasse.map(async e => {
        const statut   = getStatut(e.id)
        const existing = absences.find(a =>
          String(a.etudiant_id) === String(e.id) && String(a.seance_id) === String(seance.id)
        )
        if (existing) {
          await api.put(`/absences/${existing.id}`, { statut, justifie: existing.justifie })
        } else {
          await api.post("/absences", { etudiant_id: e.id, seance_id: seance.id, statut, justifie: false })
        }
      }))

      const res = await api.get("/absences")
      setAbsences(res.data)
      setSaved(true)
      setToast({ message: "Presences enregistrees avec succes", type: "success" })
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Erreur lors de l'enregistrement", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  const nbAbsent  = etusClasse.filter(e => getStatut(e.id) === "Absent").length
  const nbRetard  = etusClasse.filter(e => getStatut(e.id) === "Retard").length
  const nbPresent = etusClasse.filter(e => getStatut(e.id) === "Present").length
  const canShow   = classeId && date && etusClasse.length > 0

  if (loading) return <div className="container-fluid"><div className="empty-box" style={{ padding: 60 }}>Chargement...</div></div>

  return (
    <div className="container-fluid">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-title">Saisie des absences</div>
          <div className="page-description">Choisissez le classe, la matiere et la date</div>
        </div>
      </div>

      {/* Filtres simples */}
      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="label-muted">Groupe</label>
              <select className="form-select" value={groupe}
                onChange={e => { setGroupe(e.target.value); setClasseId(""); setPresences({}) }}>
                <option value="">Choisir un groupe --</option>
                {groupes.map(g => <option key={g} value={g}>Groupe {g}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="label-muted">Classe</label>
              <select className="form-select" value={classeId}
                onChange={e => { setClasseId(e.target.value); setPresences({}) }}
                disabled={!groupe}>
                <option value="">Choisir --</option>
                {classesFiltrees.map(c => <option key={c.id} value={c.id}>{c.nom_classe} — {c.filiere}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="label-muted">Date de la seance</label>
              <input type="date" className="form-control" value={date}
                onChange={e => { setDate(e.target.value); setPresences({}) }} />
            </div>
            {resolvedSeance && (
              <div className="col-md-3">
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#15803d" }}>
                  Seance existante trouvee
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {canShow && (
        <>
          {/* Stats */}
          <div className="card content-card mb-3">
            <div className="card-body" style={{ padding: "14px 20px" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex gap-3 align-items-center">
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{nbPresent} Present</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{nbAbsent} Absent</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316" }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#ea580c" }}>{nbRetard} Retard</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary"
                    onClick={() => { const r = {}; etusClasse.forEach(e => { r[e.id] = { absent: false, retard: false } }); setPresences(r) }}>
                    Tous presents
                  </button>
                  <button className="btn btn-sm btn-outline-danger"
                    onClick={() => { const r = {}; etusClasse.forEach(e => { r[e.id] = { absent: true, retard: false } }); setPresences(r) }}>
                    Tous absents
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${(nbPresent / etusClasse.length) * 100}%`, background: "#22c55e", transition: "width 0.3s" }} />
                <div style={{ width: `${(nbRetard  / etusClasse.length) * 100}%`, background: "#f97316", transition: "width 0.3s" }} />
                <div style={{ width: `${(nbAbsent  / etusClasse.length) * 100}%`, background: "#ef4444", transition: "width 0.3s" }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card content-card mb-4">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "12px 20px", width: 40 }}>#</th>
                    <th style={{ padding: "12px 16px" }}>Etudiant</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", width: 110 }}>
                      <span style={{ color: "#dc2626" }}>Absent</span>
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "center", width: 110 }}>
                      <span style={{ color: "#f97316" }}>Retard</span>
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "center", width: 120 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {etusClasse.map((e, i) => {
                    const p      = presences[e.id] || {}
                    const statut = getStatut(e.id)
                    const rowBg  = statut === "Absent" ? "#fff5f5" : statut === "Retard" ? "#fffbeb" : "white"
                    return (
                      <tr key={e.id} style={{ background: rowBg, borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 20px", color: "#9ca3af", fontSize: 13 }}>{i + 1}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                              background: statut === "Absent" ? "#fee2e2" : statut === "Retard" ? "#ffedd5" : "linear-gradient(135deg,#2563eb,#3b82f6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: statut === "Absent" ? "#dc2626" : statut === "Retard" ? "#f97316" : "white",
                              fontSize: 13, fontWeight: 700,
                            }}>
                              {e.nom[0]}{e.prenom[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{e.nom} {e.prenom}</div>
                              <div style={{ fontSize: 12, color: "#9ca3af" }}>{e.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 16px" }}>
                          <div onClick={() => toggleAbsent(e.id)} style={{
                            width: 28, height: 28, borderRadius: 8, margin: "0 auto",
                            border: `2px solid ${p.absent ? "#ef4444" : "#e5e7eb"}`,
                            background: p.absent ? "#fee2e2" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}>
                            {p.absent && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 16px" }}>
                          <div onClick={() => toggleRetard(e.id)} style={{
                            width: 28, height: 28, borderRadius: 8, margin: "0 auto",
                            border: `2px solid ${p.retard ? "#f97316" : "#e5e7eb"}`,
                            background: p.retard ? "#ffedd5" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}>
                            {p.retard && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 16px" }}>
                          <span className={`value-chip ${statut === "Absent" ? "chip-red" : statut === "Retard" ? "chip-orange" : "chip-green"}`} style={{ fontSize: 12 }}>
                            {statut}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3 mb-4">
            {saved && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 4.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Enregistre avec succes
              </div>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 180 }}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </>
      )}

      {classeId && date && etusClasse.length === 0 && (
        <div className="card content-card"><div className="empty-box">Aucun etudiant dans cette classe.</div></div>
      )}
      {!classeId && (
        <div className="card content-card"><div className="empty-box" style={{ padding: 48 }}>Choisissez une classe pour commencer</div></div>
      )}
    </div>
  )
}

export default SaisieAbsences
