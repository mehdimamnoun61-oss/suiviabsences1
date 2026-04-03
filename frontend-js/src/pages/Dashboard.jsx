import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import api from "../utils/api"

const COLOR_ABSENT = "#ef4444"
const COLOR_RETARD = "#f97316"

function getNiveau(taux) {
  if (taux >= 30) return { label: "Convocation",   color: "#dc2626" }
  if (taux >= 20) return { label: "Avertissement", color: "#f97316" }
  if (taux >= 10) return { label: "Observation",   color: "#f59e0b" }
  return              { label: "Normal",          color: "#22c55e" }
}

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    classes: 0, etudiants: 0, modules: 0, enseignants: 0,
    affectations: 0, seances: 0, absences: 0, avertissements: 0,
  })
  const [recentAbsences,      setRecentAbsences]      = useState([])
  const [absencesParClasse,   setAbsencesParClasse]   = useState([])
  const [repartitionNiveaux,  setRepartitionNiveaux]  = useState([])
  const [absencesParMois,     setAbsencesParMois]     = useState([])
  const [alertes,             setAlertes]             = useState({ conv: 0, avert: 0, obs: 0, norm: 0 })

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"), api.get("/modules"),
      api.get("/enseignants"), api.get("/affectations"), api.get("/seances"),
      api.get("/absences"),
    ]).then(([c, e, m, en, af, s, ab]) => {
      const classes      = c.data
      const etudiants    = e.data
      const modules      = m.data
      const enseignants  = en.data
      const affectations = af.data
      const seances      = s.data
      const absences     = ab.data

      // ── Alertes (taux par etudiant) ──────────────────────────────────
      const tauxList = etudiants.map(etudiant => {
        const affClasse    = affectations.filter(a => String(a.classe_id) === String(etudiant.classe_id))
        const seancesClasse = seances.filter(s => affClasse.some(a => String(a.id) === String(s.affectation_id)))
        const totalH = affClasse.reduce((sum, aff) => {
          const mod = modules.find(m => String(m.id) === String(aff.module_id))
          return sum + (mod ? mod.volume_horaire : 0)
        }, 0) || 1
        const seancesIds = seancesClasse.map(s => String(s.id))
        const nbAbs = absences.filter(a => String(a.etudiant_id) === String(etudiant.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Absent").length
        const nbRet = absences.filter(a => String(a.etudiant_id) === String(etudiant.id) && seancesIds.includes(String(a.seance_id)) && a.statut === "Retard").length
        const heuresAbs = nbAbs * (totalH / (seancesClasse.length || 1))
        const heuresRet = nbRet * (totalH / (seancesClasse.length || 1)) * 0.5
        return ((heuresAbs + heuresRet) / totalH) * 100
      })

      const conv  = tauxList.filter(t => t >= 30).length
      const avert = tauxList.filter(t => t >= 20 && t < 30).length
      const obs   = tauxList.filter(t => t >= 10 && t < 20).length
      const norm  = tauxList.filter(t => t < 10).length
      setAlertes({ conv, avert, obs, norm })

      // ── Stats cartes ─────────────────────────────────────────────────
      setStats({
        classes: classes.length, etudiants: etudiants.length,
        modules: modules.length, enseignants: enseignants.length,
        affectations: affectations.length, seances: seances.length,
        absences: absences.length, avertissements: conv + avert,
      })

      // ── Repartition niveaux (pie) ─────────────────────────────────────
      setRepartitionNiveaux([
        { name: "Convocation (30%+)",   value: conv,  fill: "#dc2626" },
        { name: "Avertissement (20%+)", value: avert, fill: "#f97316" },
        { name: "Observation (10%+)",   value: obs,   fill: "#f59e0b" },
        { name: "Normal (<10%)",         value: norm,  fill: "#22c55e" },
      ].filter(d => d.value > 0))

      // ── Absences par classe (bar) ─────────────────────────────────────
      const parClasse = classes.map(classe => {
        const idsEtus = etudiants.filter(e => String(e.classe_id) === String(classe.id)).map(e => String(e.id))
        const nbAbsent = absences.filter(a => idsEtus.includes(String(a.etudiant_id)) && a.statut === "Absent").length
        const nbRetard = absences.filter(a => idsEtus.includes(String(a.etudiant_id)) && a.statut === "Retard").length
        return { name: classe.nom_classe, Absences: nbAbsent, Retards: nbRetard }
      }).filter(c => c.Absences + c.Retards > 0)
      setAbsencesParClasse(parClasse)

      // ── Absences par mois (bar) ───────────────────────────────────────
      const parMois = {}
      absences.forEach(a => {
        const seance = seances.find(s => String(s.id) === String(a.seance_id))
        if (!seance?.date_seance) return
        const mois = seance.date_seance.slice(0, 7)
        if (!parMois[mois]) parMois[mois] = { name: mois, Absences: 0, Retards: 0 }
        if (a.statut === "Absent") parMois[mois].Absences++
        if (a.statut === "Retard") parMois[mois].Retards++
      })
      setAbsencesParMois(Object.values(parMois).sort((a, b) => a.name.localeCompare(b.name)))

      // ── Dernieres absences ────────────────────────────────────────────
      const derniers = [...absences].reverse().slice(0, 5).map(absence => {
        const etudiant = etudiants.find(e => String(e.id) === String(absence.etudiant_id))
        const seance   = seances.find(s => String(s.id) === String(absence.seance_id))
        return {
          id: absence.id,
          etudiant: etudiant ? `${etudiant.nom} ${etudiant.prenom}` : "Inconnu",
          date:     seance ? seance.date_seance : "-",
          statut:   absence.statut,
          justifie: absence.justifie,
        }
      })
      setRecentAbsences(derniers)
    }).finally(() => setLoading(false))
  }, [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ fontWeight: 700, marginBottom: 4, color: "#111827" }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color: p.fill || p.color, margin: "2px 0" }}>{p.name} : {p.value}</p>)}
      </div>
    )
  }

  const cards = [
    { title: "Classes",        value: stats.classes,        style: "bg-soft-primary" },
    { title: "Etudiants",      value: stats.etudiants,      style: "bg-soft-success" },
    { title: "Modules",        value: stats.modules,        style: "bg-soft-warning" },
    { title: "Enseignants",    value: stats.enseignants,    style: "bg-soft-info"    },
    { title: "Affectations",   value: stats.affectations,   style: "bg-soft-dark"    },
    { title: "Seances",        value: stats.seances,        style: "bg-soft-primary" },
    { title: "Absences",       value: stats.absences,       style: "bg-soft-danger"  },
    { title: "Alertes",        value: stats.avertissements, style: "bg-soft-purple"  },
  ]

  if (loading) return <div className="container-fluid"><div className="empty-box" style={{ padding: 60 }}>Chargement...</div></div>

  return (
    <div className="container-fluid">
      <div className="page-header d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-description">Suivi global et statistiques d'absenteisme</div>
        </div>
      </div>

      {/* Stats cartes */}
      <div className="row g-3 mb-4">
        {cards.map((card, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div className="card stats-card h-100">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="stats-label">{card.title}</div>
                  <div className="stats-value">{card.value}</div>
                </div>
                <div className={`stats-icon ${card.style}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes automatiques */}
      <div className="row g-3 mb-4">
        {[
          { label: "Convocation (30%+)",   val: alertes.conv,  bg: "#fee2e2", col: "#dc2626" },
          { label: "Avertissement (20%+)", val: alertes.avert, bg: "#ffedd5", col: "#f97316" },
          { label: "Observation (10%+)",   val: alertes.obs,   bg: "#fef3c7", col: "#f59e0b" },
          { label: "Normal (<10%)",         val: alertes.norm,  bg: "#dcfce7", col: "#16a34a" },
        ].map((s, i) => (
          <div className="col-md-3 col-sm-6" key={i}>
            <div className="card content-card h-100">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="stats-label">{s.label}</div>
                  <div className="stats-value" style={{ color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>etudiants</div>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.col, fontWeight: 800, fontSize: 16 }}>
                  {s.val}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card content-card h-100">
            <div className="card-body">
              <div className="section-card-title mb-3">Absences et retards par classe</div>
              {absencesParClasse.length === 0 ? (
                <p className="empty-text">Aucune donnee disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={absencesParClasse} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Absences" fill={COLOR_ABSENT} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Retards"  fill={COLOR_RETARD} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card content-card h-100">
            <div className="card-body">
              <div className="section-card-title mb-3">Repartition des niveaux</div>
              {repartitionNiveaux.length === 0 ? (
                <p className="empty-text">Aucune donnee disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={repartitionNiveaux} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {repartitionNiveaux.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [v + " etudiant(s)", name]} />
                    <Legend formatter={value => <span style={{ fontSize: 11, color: "#374151" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card content-card h-100">
            <div className="card-body">
              <div className="section-card-title mb-3">Evolution mensuelle des absences</div>
              {absencesParMois.length === 0 ? (
                <p className="empty-text">Aucune donnee disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={absencesParMois}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Absences" fill={COLOR_ABSENT} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Retards"  fill={COLOR_RETARD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card content-card h-100">
            <div className="card-body">
              <div className="section-card-title mb-3">Resume rapide</div>
              <ul className="list-group list-group-flush">
                {[
                  ["Total classes",   stats.classes],
                  ["Total etudiants", stats.etudiants],
                  ["Total absences",  stats.absences],
                  ["Alertes actives", stats.avertissements],
                ].map(([label, val]) => (
                  <li key={label} className="list-group-item d-flex justify-content-between px-0">
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
                    <strong style={{ fontSize: 14 }}>{val}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dernieres absences */}
      <div className="card content-card mb-2">
        <div className="card-body">
          <div className="section-card-title mb-3">Dernieres absences enregistrees</div>
          {recentAbsences.length === 0 ? (
            <p className="empty-text mb-0">Aucune absence enregistree.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr><th>Etudiant</th><th>Date</th><th>Statut</th><th>Justifie</th></tr>
                </thead>
                <tbody>
                  {recentAbsences.map(item => (
                    <tr key={item.id}>
                      <td><strong>{item.etudiant}</strong></td>
                      <td style={{ fontSize: 13, color: "#6b7280" }}>{item.date}</td>
                      <td><span className={`value-chip ${item.statut === "Absent" ? "chip-red" : item.statut === "Retard" ? "chip-orange" : "chip-green"}`}>{item.statut}</span></td>
                      <td><span className={`value-chip ${item.justifie ? "chip-green" : "chip-red"}`}>{item.justifie ? "Oui" : "Non"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
