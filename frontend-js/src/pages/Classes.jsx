import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers.jsx"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { nom_classe: "", filiere: "", niveau: "", groupe: "", annee_scolaire: "" }

function validate(data) {
  const errors = {}
  if (!data.nom_classe.trim())     errors.nom_classe     = "Le nom de la classe est requis"
  if (!data.filiere.trim())        errors.filiere        = "La filiere est requise"
  if (!data.niveau.trim())         errors.niveau         = "Le niveau est requis"
  if (!data.groupe.trim())         errors.groupe         = "Le groupe est requis"
  if (!data.annee_scolaire.trim()) errors.annee_scolaire = "L'annee scolaire est requise"
  else if (!/^\d{4}\/\d{4}$/.test(data.annee_scolaire)) errors.annee_scolaire = "Format invalide. Exemple: 2024/2025"
  return errors
}

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const FIELDS = [
  ["nom_classe",     "Nom de la classe",  "2025/2026"],
  ["filiere",        "Filiere",           "ex: Informatique"],
  ["niveau",         "Niveau",            "ex: L3"],
  ["groupe",         "Groupe",            "ex: A"],
  ["annee_scolaire", "Annee scolaire",    "2025/2026"],
]

function Classes() {
  const [formData, setFormData] = useState(emptyForm)
  const [classes, setClasses]   = useState([])
  const [editId, setEditId]     = useState(null)
  const [message, setMessage]   = useState("")
  const [loading, setLoading]   = useState(true)
  const [errors, setErrors]     = useState({})
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    api.get("/classes").then(res => setClasses(res.data)).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }))
  }
  const resetForm = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg   = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put(`/classes/${editId}`, formData)
        setClasses(prev => prev.map(c => c.id === editId ? res.data : c))
        showMsg("Classe modifiee avec succes")
      } else {
        const res = await api.post("/classes", formData)
        setClasses(prev => [...prev, res.data])
        showMsg("Classe ajoutee avec succes")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ nom_classe: item.nom_classe, filiere: item.filiere, niveau: item.niveau, groupe: item.groupe, annee_scolaire: item.annee_scolaire })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/classes/${row.id}`)
    setClasses(prev => prev.filter(c => c.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const columns = [
    { key: "nom_classe",     label: "Nom",     render: v => <Badge variant="blue">{v}</Badge> },
    { key: "filiere",        label: "Filiere"  },
    { key: "niveau",         label: "Niveau"   },
    { key: "groupe",         label: "Groupe"   },
    { key: "annee_scolaire", label: "Annee"    },
  ]

  const exportItems = [
    {
      label: "Export Excel",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      onClick: () => exportToExcel(classes.map(i => ({ "Nom classe": i.nom_classe, Filiere: i.filiere, Niveau: i.niveau, Groupe: i.groupe, Annee: i.annee_scolaire })), "classes.xlsx", "Classes"),
    },
    {
      label: "Export PDF",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      onClick: () => exportToPDF("Liste des Classes", ["Nom classe","Filiere","Niveau","Groupe","Annee"], classes.map(i => [i.nom_classe, i.filiere, i.niveau, i.groupe, i.annee_scolaire]), "classes.pdf"),
    },
  ]

  return (
    <div className="container-fluid">

      {/* ── Page header ── */}
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Classes</h1>
          <p className="page-header-desc">Organiser les classes, filieres, niveaux et groupes</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{classes.length} classes</span>
          <Button variant="primary" icon={<IconPlus />} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter une classe
          </Button>
        </div>
      </div>

      {/* ── Toast ── */}
      {message && (
        <div className="ui-toast ui-toast-success">
          <span className="ui-toast-icon"><IconCheck /></span>
          {message}
        </div>
      )}

      {/* ── Modal form ── */}
      <Modal
        open={showForm}
        onClose={resetForm}
        title={editId ? "Modifier une classe" : "Ajouter une classe"}
        size="md"
        footer={
          <div className="ui-modal-actions">
            <Button variant="secondary" onClick={resetForm}>Annuler</Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit} type="button">
              {editId ? "Mettre a jour" : "Ajouter"}
            </Button>
          </div>
        }
      >
        {errors._general && <div className="ui-toast ui-toast-error" style={{ marginBottom: 14 }}>{errors._general}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FIELDS.map(([name, label, placeholder]) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label className="label-muted">{label}</label>
                <input
                  type="text"
                  className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={name === "annee_scolaire" ? placeholder : ""}
                />
                <FieldError errors={errors} field={name} />
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* ── DataTable ── */}
      <DataTable
        title="Liste des classes"
        columns={columns}
        data={classes}
        loading={loading}
        emptyText="Aucune classe trouvee."
        searchKeys={["nom_classe", "filiere", "niveau", "groupe", "annee_scolaire"]}
        exportItems={exportItems}
        topRight={
          <Button variant="primary" size="sm" icon={<IconPlus />} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter
          </Button>
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Classes
