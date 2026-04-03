import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers.jsx"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { nom: "", prenom: "", email: "", tel: "", specialite: "" }

function validate(data) {
  const errors = {}
  if (!data.nom.trim())        errors.nom        = "Le nom est requis"
  if (!data.prenom.trim())     errors.prenom     = "Le prénom est requis"
  if (!data.email.trim())      errors.email      = "L'email est requis"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Email invalide"
  if (!data.tel.trim())        errors.tel        = "Le téléphone est requis"
  else if (!/^\d{10}$/.test(data.tel)) errors.tel = "Téléphone invalide (10 chiffres)"
  if (!data.specialite.trim()) errors.specialite = "La spécialité est requise"
  return errors
}

const FIELDS = [
  { name: "nom",        label: "Nom",         type: "text"  },
  { name: "prenom",     label: "Prénom",       type: "text"  },
  { name: "email",      label: "Email",        type: "email" },
  { name: "tel",        label: "Téléphone",    type: "text"  },
  { name: "specialite", label: "Spécialité",   type: "text"  },
]

function Enseignants() {
  const [formData, setFormData]       = useState(emptyForm)
  const [enseignants, setEnseignants] = useState([])
  const [editId, setEditId]           = useState(null)
  const [message, setMessage]         = useState("")
  const [loading, setLoading]         = useState(true)
  const [errors, setErrors]           = useState({})
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    api.get("/enseignants").then(res => setEnseignants(res.data)).finally(() => setLoading(false))
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
        const res = await api.put(`/enseignants/${editId}`, formData)
        setEnseignants(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Enseignant modifié avec succès")
      } else {
        const res = await api.post("/enseignants", formData)
        setEnseignants(prev => [...prev, res.data])
        showMsg("Enseignant ajouté avec succès")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ nom: item.nom, prenom: item.prenom, email: item.email, tel: item.tel, specialite: item.specialite })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/enseignants/${row.id}`)
    setEnseignants(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const columns = [
    { key: "nom",        label: "Nom"       },
    { key: "prenom",     label: "Prénom"    },
    { key: "email",      label: "Email",    sortable: false },
    { key: "tel",        label: "Tél.",     sortable: false },
    { key: "specialite", label: "Spécialité", render: v => <Badge variant="green">{v}</Badge> },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(enseignants.map(i => ({ Nom: i.nom, Prénom: i.prenom, Email: i.email, Tél: i.tel, Spécialité: i.specialite })), "enseignants.xlsx", "Enseignants") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Enseignants", ["Nom","Prénom","Email","Tél","Spécialité"], enseignants.map(i => [i.nom, i.prenom, i.email, i.tel, i.specialite]), "enseignants.pdf") },
  ]

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Enseignants</h1>
          <p className="page-header-desc">Gérer les enseignants et leurs spécialités</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{enseignants.length} enseignants</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter un enseignant
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
        title={editId ? "Modifier un enseignant" : "Ajouter un enseignant"}
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
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {FIELDS.map(({ name, label, type }) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label className="label-muted">{label}</label>
                <input type={type} className={`form-control ${errors[name] ? "is-invalid" : ""}`} name={name} value={formData[name]} onChange={handleChange} />
                <FieldError errors={errors} field={name} />
              </div>
            ))}
          </div>
        </form>
      </Modal>

      <DataTable
        title="Liste des enseignants"
        columns={columns}
        data={enseignants}
        loading={loading}
        emptyText="Aucun enseignant trouvé."
        searchKeys={["nom", "prenom", "email", "specialite"]}
        exportItems={exportItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Enseignants
