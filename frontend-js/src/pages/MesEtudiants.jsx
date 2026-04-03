import { useEffect, useState, useMemo } from "react"
import api from "../utils/api"
import { useNavigate } from "react-router-dom"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"

const NIVEAU_VARIANT = { Convocation: "red", Avertissement: "orange", Observation: "yellow", Normal: "green" }

function getNiveau(taux) {
  if (taux >= 30) return "Convocation"
  if (taux >= 20) return "Avertissement"
  if (taux >= 10) return "Observation"
  return "Normal"
}

function MesEtudiants() {
  const [classes,      setClasses]      = useState([])
  const [etudiants,    setEtudiants]    = useState([])
  const [affectations, setAffectations] = useState([])
  const [absences,     setAbsences]     = useState([])
  const [seances,      setSeances]      = useState([])
  const [classeId,     setClasseId]     = useState("")
  const [loading,      setLoading]      = useState(true)
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    Promise.all([
      api.get("/classes"), api.get("/etudiants"),
      api.get("/affectations"), api.get("/absences"), api.get("/seances"),
    ]).then(([c, e, af, ab, s]) => {
      setClasses(c.data); setEtudiants(e.data)
      setAffectations(af.data); setAbsences(ab.data); setSeances(s.data)
    }).finally(() => setLoading(false))
  }, [])

  const classe = classes.find(c => String(c.id) === String(classeId))

  const etusClasse = useMemo(() =>
    etudiants.filter(e => String(e.classe_id) === String(classeId)),
    [etudiants, classeId]
  )

  const getTaux = (etudiantId) => {
    const affClasse = affectations.filter(a => String(a.classe_id) === String(classeId))
    const seancesClasse = seances.filter(s => affClasse.some(a => String(a.id) === String(s.affectation_id)))
    const total = seancesClasse.length || 1
    const seancesIds = seancesClasse.map(s => String(s.id))
    const nbAbs = absences.filter(a => String(a.etudiant_id) === String(etudiantId) && seancesIds.includes(String(a.seance_id)) && a.statut === "Absent").length
    const nbRet = absences.filter(a => String(a.etudiant_id) === String(etudiantId) && seancesIds.includes(String(a.seance_id)) && a.statut === "Retard").length
    return Math.round(((nbAbs + nbRet * 0.5) / total) * 1000) / 10
  }

  const enriched = useMemo(() => etusClasse.map(e => {
    const taux = getTaux(e.id)
    return { ...e, taux, niveau: getNiveau(taux) }
  }), [etusClasse, absences, seances, affectations, classeId])

  const columns = [
    {
      key: "nom",
      label: "Étudiant",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#4F46E5,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
            {row.nom[0]}{row.prenom[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{row.nom} {row.prenom}</div>
            <div style={{ fontSize: 11.5, color: "#94A3B8" }}>{row.sex}</div>
          </div>
        </div>
      ),
    },
    { key: "email",  label: "Email",  sortable: false, render: v => <span style={{ fontSize: 12.5, color: "#64748B" }}>{v}</span> },
    { key: "tel",    label: "Tél.",   sortable: false },
    {
      key: "taux",
      label: "Taux d'absence",
      render: (v) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: v >= 30 ? "#DC2626" : v >= 20 ? "#F97316" : v >= 10 ? "#F59E0B" : "#22C55E" }}>{v}%</span>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: "#E2E8F0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(v, 100)}%`, background: v >= 30 ? "#DC2626" : v >= 20 ? "#F97316" : v >= 10 ? "#F59E0B" : "#22C55E", borderRadius: 2 }} />
          </div>
        </div>
      ),
    },
    { key: "niveau", label: "Niveau", render: v => <Badge variant={NIVEAU_VARIANT[v]} dot>{v}</Badge> },
  ]

  const classeFilterJSX = (
    <select
      className="ui-filter-select"
      value={classeId}
      onChange={e => setClasseId(e.target.value)}
      aria-label="Choisir une classe"
      style={{ minWidth: 220 }}
    >
      <option value="">Choisir une classe</option>
      {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe} — {c.filiere} — Gr. {c.groupe}</option>)}
    </select>
  )

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Mes Étudiants</h1>
          <p className="page-header-desc">Liste des étudiants de votre classe avec suivi des absences</p>
        </div>
        <div className="page-header-right">
          {classeId && (
            <>
              <span className="page-count-badge">{etusClasse.length} étudiants</span>
              <Button
                variant="primary"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                onClick={() => navigate(`/saisie-absences?classe=${classeId}&date=${today}`)}
              >
                Saisie du jour
              </Button>
            </>
          )}
        </div>
      </div>

      {classe && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[["Filière", classe.filiere], ["Niveau", classe.niveau], ["Groupe", classe.groupe], ["Année", classe.annee_scolaire]].map(([label, val]) => (
            <div key={label} className="page-count-badge" style={{ background: "rgba(100,116,139,0.08)", color: "#475569", borderColor: "rgba(100,116,139,0.15)" }}>
              <span style={{ color: "#94A3B8" }}>{label}:</span> {val}
            </div>
          ))}
        </div>
      )}

      <DataTable
        title={classeId ? `Étudiants — ${classe?.nom_classe || ""}` : "Étudiants"}
        columns={columns}
        data={enriched}
        loading={loading}
        emptyText={classeId ? "Aucun étudiant dans cette classe." : "Choisissez une classe pour afficher les étudiants."}
        searchKeys={["nom", "prenom", "email"]}
        filters={classeFilterJSX}
      />
    </div>
  )
}

export default MesEtudiants
