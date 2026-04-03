import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers"
import SearchSelect from "../components/SearchSelect"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { affectation_id: "", date_seance: "", heure_debut: "", heure_fin: "", duree: "", statut: "" }

function validate(data) {
  const errors = {}
  if (!data.affectation_id) errors.affectation_id = "L'affectation est requise"
  if (!data.date_seance)    errors.date_seance    = "La date est requise"
  if (!data.heure_debut)    errors.heure_debut    = "L'heure de début est requise"
  if (!data.heure_fin)      errors.heure_fin      = "L'heure de fin est requise"
  else if (data.heure_debut && data.heure_fin <= data.heure_debut) errors.heure_fin = "L'heure de fin doit être après l'heure de début"
  if (!data.duree)          errors.duree          = "La durée est requise"
  else if (isNaN(data.duree) || Number(data.duree) < 1) errors.duree = "La durée doit être au moins 1 minute"
  if (!data.statut)         errors.statut         = "Le statut est requis"
  return errors
}

const STATUT_VARIANT = { realisee: "green", annulee: "red", planifiee: "blue" }

function Seances() {
  const [formData, setFormData]         = useState(emptyForm)
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
    Promise.all([api.get("/seances"), api.get("/affectations")]).then(([s, a]) => {
      setSeances(s.data); setAffectations(a.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" })) }
  const resetForm = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }

  const getAffectationLabel = (id) => {
    const a = affectations.find(a => String(a.id) === String(id))
    if (!a) return "Affectation inconnue"
    if (a.enseignant && a.module && a.classe)
      return `${a.enseignant.nom} ${a.enseignant.prenom} — ${a.module.nom_module} — ${a.classe.nom_classe}`
    return `Affectation #${id}`
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put(`/seances/${editId}`, formData)
        setSeances(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Séance modifiée avec succès")
      } else {
        const res = await api.post("/seances", formData)
        setSeances(prev => [...prev, res.data])
        showMsg("Séance ajoutée avec succès")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ affectation_id: item.affectation_id, date_seance: item.date_seance, heure_debut: item.heure_debut, heure_fin: item.heure_fin, duree: item.duree, statut: item.statut })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/seances/${row.id}`)
    setSeances(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const enriched = seances.map(s => ({ ...s, affectation_label: getAffectationLabel(s.affectation_id) }))
  const filtered = filterStatut ? enriched.filter(s => s.statut === filterStatut) : enriched

  const columns = [
    { key: "affectation_label", label: "Affectation", sortable: false, render: v => <span style={{ fontSize: 12.5 }}>{v}</span> },
    { key: "date_seance",       label: "Date"         },
    { key: "heure_debut",       label: "Début",       sortable: false },
    { key: "heure_fin",         label: "Fin",         sortable: false },
    { key: "duree",             label: "Durée",       render: v => <span>{v} <span style={{ color: "#94A3B8" }}>min</span></span> },
    { key: "statut",            label: "Statut",      render: v => <Badge variant={STATUT_VARIANT[v] || "gray"}>{v}</Badge> },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(seances.map(i => ({ Affectation: getAffectationLabel(i.affectation_id), Date: i.date_seance, "Heure début": i.heure_debut, "Heure fin": i.heure_fin, Durée: i.duree, Statut: i.statut })), "seances.xlsx", "Seances") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Séances", ["Affectation","Date","Heure début","Heure fin","Durée","Statut"], seances.map(i => [getAffectationLabel(i.affectation_id), i.date_seance, i.heure_debut, i.heure_fin, i.duree, i.statut]), "seances.pdf") },
  ]

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  const filtersJSX = (
    <select className="ui-filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} aria-label="Filtrer par statut">
      <option value="">Tous les statuts</option>
      <option value="planifiee">Planifiée</option>
      <option value="realisee">Réalisée</option>
      <option value="annulee">Annulée</option>
    </select>
  )

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Séances</h1>
          <p className="page-header-desc">Planifier et suivre les séances liées aux affectations</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{seances.length} séances</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter une séance
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
        title={editId ? "Modifier une séance" : "Ajouter une séance"}
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
            <label className="label-muted">Affectation</label>
            <SearchSelect options={affectations.map(a => ({ value: a.id, label: getAffectationLabel(a.id) }))} value={formData.affectation_id} onChange={v => { setFormData(p => ({ ...p, affectation_id: v })); setErrors(p => ({ ...p, affectation_id: "" })) }} placeholder="Choisir une affectation" />
            <FieldError errors={errors} field="affectation_id" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="label-muted">Date</label>
              <input type="date" className={`form-control ${errors.date_seance ? "is-invalid" : ""}`} name="date_seance" value={formData.date_seance} onChange={handleChange} />
              <FieldError errors={errors} field="date_seance" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="label-muted">Durée (min)</label>
              <input type="number" className={`form-control ${errors.duree ? "is-invalid" : ""}`} name="duree" value={formData.duree} onChange={handleChange} min="1" />
              <FieldError errors={errors} field="duree" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="label-muted">Heure début</label>
              <input type="time" className={`form-control ${errors.heure_debut ? "is-invalid" : ""}`} name="heure_debut" value={formData.heure_debut} onChange={handleChange} />
              <FieldError errors={errors} field="heure_debut" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="label-muted">Heure fin</label>
              <input type="time" className={`form-control ${errors.heure_fin ? "is-invalid" : ""}`} name="heure_fin" value={formData.heure_fin} onChange={handleChange} />
              <FieldError errors={errors} field="heure_fin" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Statut</label>
            <SearchSelect options={[{ value: "planifiee", label: "Planifiée" }, { value: "realisee", label: "Réalisée" }, { value: "annulee", label: "Annulée" }]} value={formData.statut} onChange={v => { setFormData(p => ({ ...p, statut: v })); setErrors(p => ({ ...p, statut: "" })) }} placeholder="Choisir un statut" />
            <FieldError errors={errors} field="statut" />
          </div>
        </form>
      </Modal>

      <DataTable
        title="Liste des séances"
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="Aucune séance trouvée."
        searchKeys={["affectation_label", "date_seance", "statut"]}
        filters={filtersJSX}
        exportItems={exportItems}
        topRight={<Button variant="primary" size="sm" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>Ajouter</Button>}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Seances
