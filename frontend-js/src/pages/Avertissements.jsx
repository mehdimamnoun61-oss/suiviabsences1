import { useEffect, useMemo, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { generateAvertissementPDF } from "../utils/pdfAvertissement"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"

const NIVEAU_VARIANT = { Convocation: "red", Avertissement: "orange", Observation: "yellow" }

function Avertissements() {
  const [etudiants, setEtudiants] = useState([])
  const [absences, setAbsences]   = useState([])
  const [classes, setClasses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterNiveau, setFilterNiveau] = useState("")

  useEffect(() => {
    Promise.all([api.get("/etudiants"), api.get("/absences"), api.get("/classes")]).then(([e, a, c]) => {
      setEtudiants(e.data); setAbsences(a.data); setClasses(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const getClasseNom = (id) => { const c = classes.find(c => String(c.id) === String(id)); return c ? c.nom_classe : "Inconnue" }

  const avertissements = useMemo(() => {
    const compteur = {}
    absences.forEach(a => { if (a.statut === "Absent") compteur[a.etudiant_id] = (compteur[a.etudiant_id] || 0) + 1 })
    return etudiants
      .map(e => {
        const nbAbs = compteur[e.id] || 0
        const taux  = nbAbs * 10
        const niveau = taux >= 30 ? "Convocation" : taux >= 20 ? "Avertissement" : "Observation"
        return { id: e.id, nom: e.nom, prenom: e.prenom, email: e.email, classe: getClasseNom(e.classe_id), classe_id: e.classe_id, absences: nbAbs, taux, taux_absence: `${taux}%`, niveau }
      })
      .filter(item => item.absences >= 2)
  }, [etudiants, absences, classes])

  const filtered = filterNiveau ? avertissements.filter(a => a.niveau === filterNiveau) : avertissements

  const handleGeneratePDF = async (item) => {
    await generateAvertissementPDF({
      etudiant: { id: item.id, nom: item.nom, prenom: item.prenom, email: item.email, classe: item.classe },
      modules: [], taux: item.taux, niveau: item.niveau,
    })
  }

  const pdfIcon = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>

  const columns = [
    { key: "nom",          label: "Nom"      },
    { key: "prenom",       label: "Prénom"   },
    { key: "email",        label: "Email",   sortable: false },
    { key: "classe",       label: "Classe",  render: v => <Badge variant="blue">{v}</Badge> },
    { key: "absences",     label: "Absences" },
    { key: "taux_absence", label: "Taux",    render: (v, row) => <Badge variant={row.taux >= 30 ? "red" : row.taux >= 20 ? "orange" : "yellow"}>{v}</Badge> },
    { key: "niveau",       label: "Niveau",  render: v => <Badge variant={NIVEAU_VARIANT[v] || "gray"} dot>{v}</Badge> },
    {
      key: "id",
      label: "Document",
      sortable: false,
      render: (_, row) => (
        <Button variant="danger" size="sm" icon={pdfIcon} onClick={() => handleGeneratePDF(row)}>
          Générer PDF
        </Button>
      ),
    },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(avertissements.map(i => ({ Nom: i.nom, Prénom: i.prenom, Email: i.email, Classe: i.classe, Absences: i.absences, Taux: i.taux_absence, Niveau: i.niveau })), "avertissements.xlsx", "Avertissements") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Avertissements", ["Nom","Prénom","Email","Classe","Absences","Taux","Niveau"], avertissements.map(i => [i.nom, i.prenom, i.email, i.classe, i.absences, i.taux_absence, i.niveau]), "avertissements.pdf") },
  ]

  const filtersJSX = (
    <select className="ui-filter-select" value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} aria-label="Filtrer par niveau">
      <option value="">Tous les niveaux</option>
      <option value="Convocation">Convocation</option>
      <option value="Avertissement">Avertissement</option>
      <option value="Observation">Observation</option>
    </select>
  )

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Avertissements</h1>
          <p className="page-header-desc">Liste des étudiants nécessitant un avertissement</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{filtered.length} avertissements</span>
        </div>
      </div>

      <DataTable
        title="Liste des avertissements"
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="Aucun avertissement pour le moment."
        searchKeys={["nom", "prenom", "email", "classe"]}
        filters={filtersJSX}
        exportItems={exportItems}
      />
    </div>
  )
}

export default Avertissements
