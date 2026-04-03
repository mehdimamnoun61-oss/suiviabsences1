import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers.jsx"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { nom: "", prenom: "", tel: "", date_naissance: "", sex: "", email: "", classe_id: "" }

function validate(data) {
  const errors = {}
  if (!data.nom.trim())    errors.nom    = "Le nom est requis"
  if (!data.prenom.trim()) errors.prenom = "Le prenom est requis"
  if (!data.tel.trim())    errors.tel    = "Le telephone est requis"
  else if (!/^\d{10}$/.test(data.tel)) errors.tel = "Telephone invalide (10 chiffres)"
  if (!data.date_naissance) errors.date_naissance = "La date de naissance est requise"
  if (!data.sex)            errors.sex   = "Le sexe est requis"
  if (!data.email.trim())   errors.email = "L email est requis"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Email invalide"
  if (!data.classe_id)      errors.classe_id = "La classe est requise"
  return errors
}

function Etudiants() {
  const [formData, setFormData]   = useState(emptyForm)
  const [etudiants, setEtudiants] = useState([])
  const [classes, setClasses]     = useState([])
  const [editId, setEditId]       = useState(null)
  const [message, setMessage]     = useState("")
  const [loading, setLoading]     = useState(true)
  const [errors, setErrors]       = useState({})
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [filterClasse, setFilterClasse] = useState("")

  useEffect(() => {
    Promise.all([api.get("/etudiants"), api.get("/classes")]).then(([e, c]) => {
      setEtudiants(e.data); setClasses(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }))
  }
  const resetForm    = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg      = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }
  const getClasseNom = (id) => { const c = classes.find(c => String(c.id) === String(id)); return c ? c.nom_classe : "Inconnue" }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put("/etudiants/" + editId, formData)
        setEtudiants(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Etudiant modifie avec succes")
      } else {
        const res = await api.post("/etudiants", formData)
        setEtudiants(prev => [...prev, res.data])
        showMsg("Etudiant ajoute avec succes")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ nom: item.nom, prenom: item.prenom, tel: item.tel, date_naissance: item.date_naissance, sex: item.sex, email: item.email, classe_id: item.classe_id })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }

  const handleDelete = async (row) => {
    await api.delete("/etudiants/" + row.id)
    setEtudiants(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const enriched = etudiants.map(e => ({ ...e, classe_nom: getClasseNom(e.classe_id) }))
  const filtered  = filterClasse ? enriched.filter(e => String(e.classe_id) === filterClasse) : enriched

  const columns = [
    { key: "nom",            label: "Nom"            },
    { key: "prenom",         label: "Prenom"         },
    { key: "tel",            label: "Tel",           sortable: false },
    { key: "date_naissance", label: "Date naissance" },
    { key: "sex",            label: "Sexe",          render: v => <Badge variant={v === "homme" ? "blue" : "purple"}>{v}</Badge> },
    { key: "email",          label: "Email",         sortable: false },
    { key: "classe_nom",     label: "Classe",        render: v => <Badge variant="gray">{v}</Badge> },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(etudiants.map(i => ({ Nom: i.nom, Prenom: i.prenom, Tel: i.tel, Sexe: i.sex, Email: i.email, Classe: getClasseNom(i.classe_id) })), "etudiants.xlsx", "Etudiants") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Etudiants", ["Nom","Prenom","Tel","Sexe","Email","Classe"], etudiants.map(i => [i.nom, i.prenom, i.tel, i.sex, i.email, getClasseNom(i.classe_id)]), "etudiants.pdf") },
  ]

  const filtersJSX = (
    <select className="ui-filter-select" value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
      <option value="">Toutes les classes</option>
      {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
    </select>
  )

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Etudiants</h1>
          <p className="page-header-desc">Ajouter, modifier et suivre les etudiants</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{etudiants.length} etudiants</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>Ajouter un etudiant</Button>
        </div>
      </div>

      {message && (
        <div className="ui-toast ui-toast-success">
          <span className="ui-toast-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
          {message}
        </div>
      )}

      <Modal open={showForm} onClose={resetForm} title={editId ? "Modifier un etudiant" : "Ajouter un etudiant"} size="lg"
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[["nom","Nom","text"],["prenom","Prenom","text"],["tel","Telephone","text"],["date_naissance","Date de naissance","date"],["email","Email","email"]].map(([name, label, type]) => (
              <div key={name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label className="label-muted">{label}</label>
                <input type={type} className={"form-control" + (errors[name] ? " is-invalid" : "")} name={name} value={formData[name]} onChange={handleChange} />
                <FieldError errors={errors} field={name} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label className="label-muted">Sexe</label>
              <select className={"form-select" + (errors.sex ? " is-invalid" : "")} name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Choisir</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
              <FieldError errors={errors} field="sex" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: "span 3" }}>
              <label className="label-muted">Classe</label>
              <select className={"form-select" + (errors.classe_id ? " is-invalid" : "")} name="classe_id" value={formData.classe_id} onChange={handleChange}>
                <option value="">Choisir une classe</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe} - {c.filiere}</option>)}
              </select>
              <FieldError errors={errors} field="classe_id" />
            </div>
          </div>
        </form>
      </Modal>

      <DataTable
        title="Liste des etudiants"
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="Aucun etudiant trouve."
        searchKeys={["nom", "prenom", "email", "tel", "classe_nom"]}
        filters={filtersJSX}
        exportItems={exportItems}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Etudiants