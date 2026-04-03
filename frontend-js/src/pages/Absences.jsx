import { useEffect, useState, useMemo } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers.jsx"
import SearchSelect from "../components/SearchSelect"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { etudiant_id: "", seance_id: "", statut: "", justifie: false }

function validate(data) {
  const errors = {}
  if (!data.etudiant_id) errors.etudiant_id = "L'étudiant est requis"
  if (!data.seance_id)   errors.seance_id   = "La séance est requise"
  if (!data.statut)      errors.statut      = "Le statut est requis"
  return errors
}

const STATUT_VARIANT = { Absent: "red", Retard: "orange", Present: "green" }

function Absences() {
  const [formData, setFormData]         = useState(emptyForm)
  const [absences, setAbsences]         = useState([])
  const [etudiants, setEtudiants]       = useState([])
  const [seances, setSeances]           = useState([])
  const [affectations, setAffectations] = useState([])
  const [editId, setEditId]             = useState(null)
  const [message, setMessage]           = useState("")
  const [loading, setLoading]           = useState(true)
  const [errors, setErrors]             = useState({})
  const [showForm, setShowForm]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [filterStatut, setFilterStatut] = useState("")

  useEffect(() => {
    Promise.all([api.get("/absences"), api.get("/etudiants"), api.get("/seances"), api.get("/affectations")]).then(([a, e, s, af]) => {
      setAbsences(a.data); setEtudiants(e.data); setSeances(s.data); setAffectations(af.data)
    }).finally(() => setLoading(false))
  }, [])

  const resetForm = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }

  const getEtudiantNom = (id) => { const e = etudiants.find(e => String(e.id) === String(id)); return e ? `${e.nom} ${e.prenom}` : "Inconnu" }
  const getSeanceLabel = (id) => {
    const s = seances.find(s => String(s.id) === String(id))
    if (!s) return "Séance inconnue"
    const a = s.affectation
    if (a) return `${s.date_seance} | ${a.module?.nom_module || ""} | ${a.classe?.nom_classe || ""}`
    return `${s.date_seance} — ${s.heure_debut}`
  }

  const seancesFiltrees = useMemo(() => {
    if (!formData.etudiant_id) return seances
    const etudiant = etudiants.find(e => String(e.id) === String(formData.etudiant_id))
    if (!etudiant) return seances
    const affClasse = affectations.filter(a => String(a.classe_id) === String(etudiant.classe_id))
    return seances.filter(s => affClasse.some(a => String(a.id) === String(s.affectation_id)))
  }, [formData.etudiant_id, seances, etudiants, affectations])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    const payload = { ...formData, justifie: formData.justifie ? 1 : 0 }
    try {
      if (editId) {
        const res = await api.put(`/absences/${editId}`, payload)
        setAbsences(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Absence modifiée avec succès")
      } else {
        const res = await api.post("/absences", payload)
        setAbsences(prev => [...prev, res.data])
        showMsg("Absence ajoutée avec succès")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ etudiant_id: item.etudiant_id, seance_id: item.seance_id, statut: item.statut, justifie: !!item.justifie })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/absences/${row.id}`)
    setAbsences(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const enriched = absences.map(a => ({
    ...a,
    etudiant_nom: getEtudiantNom(a.etudiant_id),
    seance_label: getSeanceLabel(a.seance_id),
  }))
  const filtered = filterStatut ? enriched.filter(a => a.statut === filterStatut) : enriched

  const columns = [
    { key: "etudiant_nom", label: "Étudiant" },
    { key: "seance_label", label: "Séance",   sortable: false, render: v => <span style={{ fontSize: 12.5, color: "#64748B" }}>{v}</span> },
    { key: "statut",       label: "Statut",   render: v => <Badge variant={STATUT_VARIANT[v] || "gray"}>{v}</Badge> },
    { key: "justifie",     label: "Justifié", render: v => <Badge variant={v ? "green" : "red"}>{v ? "Oui" : "Non"}</Badge> },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(absences.map(i => ({ Étudiant: getEtudiantNom(i.etudiant_id), Séance: getSeanceLabel(i.seance_id), Statut: i.statut, Justifié: i.justifie ? "Oui" : "Non" })), "absences.xlsx", "Absences") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Absences", ["Étudiant","Séance","Statut","Justifié"], absences.map(i => [getEtudiantNom(i.etudiant_id), getSeanceLabel(i.seance_id), i.statut, i.justifie ? "Oui" : "Non"]), "absences.pdf") },
  ]

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  const filtersJSX = (
    <select className="ui-filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} aria-label="Filtrer par statut">
      <option value="">Tous les statuts</option>
      <option value="Absent">Absent</option>
      <option value="Retard">Retard</option>
      <option value="Present">Présent</option>
    </select>
  )

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Absences</h1>
          <p className="page-header-desc">Suivre les absences, retards et justifications</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{absences.length} enregistrements</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter une absence
          </Button>
        </div>
      </div>

      {message && (
        <div className="ui-toast ui-toast-success">
          <span className="ui-toast-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          {message}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? "Modifier une absence" : "Ajouter une absence"}
        size="md"
        footer={
          <div className="ui-modal-actions">
            <Button variant="secondary" onClick={resetForm}>Annuler</Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit} type="button">
              {editId ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        }
      >
        {errors._general && <div className="ui-toast ui-toast-error">{errors._general}</div>}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Étudiant</label>
            <SearchSelect
              options={etudiants.map(e => ({ value: e.id, label: `${e.nom} ${e.prenom}` }))}
              value={formData.etudiant_id}
              onChange={v => { setFormData(p => ({ ...p, etudiant_id: v, seance_id: "" })); setErrors(p => ({ ...p, etudiant_id: "" })) }}
              placeholder="Rechercher un étudiant..."
            />
            <FieldError errors={errors} field="etudiant_id" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Séance</label>
            <select
              className={`form-select ${errors.seance_id ? "is-invalid" : ""}`}
              value={formData.seance_id}
              onChange={e => { setFormData(p => ({ ...p, seance_id: e.target.value })); setErrors(p => ({ ...p, seance_id: "" })) }}
              disabled={!formData.etudiant_id}
            >
              <option value="">Choisir une séance</option>
              {seancesFiltrees.map(s => <option key={s.id} value={s.id}>{getSeanceLabel(s.id)}</option>)}
            </select>
            <FieldError errors={errors} field="seance_id" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Statut</label>
            <SearchSelect
              options={[{ value: "Absent", label: "Absent" }, { value: "Retard", label: "Retard" }, { value: "Present", label: "Présent" }]}
              value={formData.statut}
              onChange={v => { setFormData(p => ({ ...p, statut: v, justifie: false })); setErrors(p => ({ ...p, statut: "" })) }}
              placeholder="Choisir statut..."
            />
            <FieldError errors={errors} field="statut" />
          </div>
          {(formData.statut === "Absent" || formData.statut === "Retard") && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className="form-check-input"
                type="checkbox"
                id="justifie"
                checked={formData.justifie}
                onChange={e => setFormData(p => ({ ...p, justifie: e.target.checked }))}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="justifie" style={{ fontSize: 13, color: "#374151", cursor: "pointer" }}>Absence justifiée</label>
            </div>
          )}
        </form>
      </Modal>

      <DataTable
        title="Liste des absences"
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="Aucune absence trouvée."
        searchKeys={["etudiant_nom", "seance_label", "statut"]}
        filters={filtersJSX}
        exportItems={exportItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Absences
