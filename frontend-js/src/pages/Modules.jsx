import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers.jsx"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { nom_module: "", volume_horaire: "" }

function validate(data) {
  const errors = {}
  if (!data.nom_module.trim()) errors.nom_module = "Le nom du module est requis"
  if (!data.volume_horaire)    errors.volume_horaire = "Le volume horaire est requis"
  else if (isNaN(data.volume_horaire) || Number(data.volume_horaire) < 1) errors.volume_horaire = "Doit être au moins 1"
  else if (Number(data.volume_horaire) > 500) errors.volume_horaire = "Ne peut pas dépasser 500"
  return errors
}

function Modules() {
  const [formData, setFormData] = useState(emptyForm)
  const [modules, setModules]   = useState([])
  const [editId, setEditId]     = useState(null)
  const [message, setMessage]   = useState("")
  const [loading, setLoading]   = useState(true)
  const [errors, setErrors]     = useState({})
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get("/modules").then(res => setModules(res.data)).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }))
  }
  const resetForm = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put(`/modules/${editId}`, formData)
        setModules(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Module modifié avec succès")
      } else {
        const res = await api.post("/modules", formData)
        setModules(prev => [...prev, res.data])
        showMsg("Module ajouté avec succès")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ nom_module: item.nom_module, volume_horaire: item.volume_horaire })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/modules/${row.id}`)
    setModules(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const columns = [
    { key: "nom_module",     label: "Nom du module", render: v => <Badge variant="orange">{v}</Badge> },
    { key: "volume_horaire", label: "Volume horaire", render: v => <span style={{ fontWeight: 600 }}>{v} <span style={{ color: "#94A3B8", fontWeight: 400 }}>h</span></span> },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(modules.map(i => ({ "Nom module": i.nom_module, "Volume horaire": i.volume_horaire })), "modules.xlsx", "Modules") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Modules", ["Nom module","Volume horaire"], modules.map(i => [i.nom_module, i.volume_horaire]), "modules.pdf") },
  ]

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Modules</h1>
          <p className="page-header-desc">Gérer les modules et leurs volumes horaires</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{modules.length} modules</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter un module
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
        title={editId ? "Modifier un module" : "Ajouter un module"}
        size="sm"
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
            <label className="label-muted">Nom du module</label>
            <input type="text" className={`form-control ${errors.nom_module ? "is-invalid" : ""}`} name="nom_module" value={formData.nom_module} onChange={handleChange} />
            <FieldError errors={errors} field="nom_module" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Volume horaire (heures)</label>
            <input type="number" className={`form-control ${errors.volume_horaire ? "is-invalid" : ""}`} name="volume_horaire" value={formData.volume_horaire} onChange={handleChange} min="1" max="500" />
            <FieldError errors={errors} field="volume_horaire" />
          </div>
        </form>
      </Modal>

      <DataTable
        title="Liste des modules"
        columns={columns}
        data={modules}
        loading={loading}
        emptyText="Aucun module trouvé."
        searchKeys={["nom_module"]}
        exportItems={exportItems}
        topRight={<Button variant="primary" size="sm" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>Ajouter</Button>}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Modules
