import { useEffect, useState, useMemo } from "react"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"

function MesEtudiants() {
  const [classes,      setClasses]      = useState([])
  const [etudiants,    setEtudiants]    = useState([])
  const [affectations, setAffectations] = useState([])
  const [absences,     setAbsences]     = useState([])
  const [seances,      setSeances]      = useState([])
  const [classeId,     setClasseId]     = useState("")
  const [search,       setSearch]       = useState("")
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"),
      api.get("/affectations"), api.get("/absences"), api.get("/seances"),
    ]).then(([c, e, af, ab, s]) => {
      setClasses(c.data); setEtudiants(e.data)
      setAffectations(af.data); setAbsences(ab.data); setSeances(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const classe = classes.find(c => String(c.id) === String(classeId))

  const etusClasse = useMemo(() =>
    etudiants.filter(e => String(e.classe_id) === String(classeId)),
    [etudiants, classeId]
  )

  // Taux d'absence par etudiant
  const getTaux = (etudiantId) => {
    const affClasse = affectations.filter(a => String(a.classe_id) === String(classeId))
    const seancesClasse = seances.filter(s => affClasse.some(a => String(a.id) === String(s.affectation_id)))
    const total = seancesClasse.length || 1
    const seancesIds = seancesClasse.map(s => String(s.id))
    const nbAbs = absences.filter(a => String(a.etudiant_id) === String(etudiantId) && seancesIds.includes(String(a.seance_id)) && a.statut === "Absent").length
    const nbRet = absences.filter(a => String(a.etudiant_id) === String(etudiantId) && seancesIds.includes(String(a.seance_id)) && a.statut === "Retard").length
    return Math.round(((nbAbs + nbRet * 0.5) / total) * 1000) / 10
  }

  const getNiveau = (taux) => {
    if (taux >= 30) return { label: "Convocation",   chip: "chip-red"    }
    if (taux >= 20) return { label: "Avertissement", chip: "chip-orange" }
    if (taux >= 10) return { label: "Observation",   chip: "chip-yellow" }
    return              { label: "Normal",          chip: "chip-green"  }
  }

  const filtered = etusClasse.filter(e =>
    `${e.nom} ${e.prenom} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="container-fluid"><div className="empty-box" style={{ padding: 60 }}>Chargement...</div></div>

  return (
    <div className="container-fluid">
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-title">Mes etudiants</div>
          <div className="page-description">Liste des etudiants de votre classe</div>
        </div>
        {classeId && (
          <div className="d-flex gap-2 align-items-center">
            <div className="page-badge">{etusClasse.length} etudiants</div>
            <button className="btn btn-primary btn-sm"
              onClick={() => navigate(`/saisie-absences?classe=${classeId}&date=${today}`)}>
              Saisie du jour
            </button>
          </div>
        )}
      </div>

      {/* Filtre classe */}
      <div className="card content-card mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="label-muted">Classe</label>
              <select className="form-select" value={classeId} onChange={e => { setClasseId(e.target.value); setSearch("") }}>
                <option value="">Choisir une classe --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe} — {c.filiere} — Groupe {c.groupe}</option>)}
              </select>
            </div>
            {classeId && (
              <div className="col-md-4">
                <label className="label-muted">Rechercher</label>
                <input type="text" className="form-control" placeholder="Nom, prenom, email..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info classe */}
      {classe && (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            ["Classe",  classe.nom_classe],
            ["Filiere", classe.filiere],
            ["Niveau",  classe.niveau],
            ["Groupe",  classe.groupe],
            ["Annee",   classe.annee_scolaire],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 16px", fontSize: 13 }}>
              <span style={{ color: "#94a3b8", marginRight: 6 }}>{label}:</span>
              <strong style={{ color: "#1e293b" }}>{val}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {classeId && (
        <div className="card content-card">
          <div className="card-body" style={{ padding: 0 }}>
            {filtered.length === 0 ? (
              <div className="empty-box">Aucun etudiant trouve.</div>
            ) : (
              <table className="table align-middle mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ padding: "12px 20px", width: 40 }}>#</th>
                    <th style={{ padding: "12px 16px" }}>Etudiant</th>
                    <th style={{ padding: "12px 16px" }}>Email</th>
                    <th style={{ padding: "12px 16px" }}>Tel</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>Taux absence</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>Niveau</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => {
                    const taux   = getTaux(e.id)
                    const niveau = getNiveau(taux)
                    return (
                      <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 20px", color: "#9ca3af" }}>{i + 1}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: 13, fontWeight: 700,
                            }}>
                              {e.nom[0]}{e.prenom[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{e.nom} {e.prenom}</div>
                              <div style={{ fontSize: 12, color: "#9ca3af" }}>{e.sex}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{e.email}</td>
                        <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 13 }}>{e.tel}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: taux >= 30 ? "#dc2626" : taux >= 20 ? "#f97316" : taux >= 10 ? "#f59e0b" : "#22c55e" }}>
                              {taux}%
                            </span>
                            <div style={{ width: 80, height: 5, borderRadius: 3, background: "#e5e7eb", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(taux, 100)}%`, background: taux >= 30 ? "#dc2626" : taux >= 20 ? "#f97316" : taux >= 10 ? "#f59e0b" : "#22c55e" }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <span className={`value-chip ${niveau.chip}`}>{niveau.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {!classeId && (
        <div className="card content-card">
          <div className="empty-box" style={{ padding: 48 }}>Choisissez une classe pour afficher les etudiants</div>
        </div>
      )}
    </div>
  )
}

export default MesEtudiants
