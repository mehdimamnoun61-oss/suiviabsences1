import { useEffect, useState } from "react"
import { exportToExcel, exportToPDF } from "../utils/exportHelpers"
import api from "../utils/api"
import { extractErrors, FieldError } from "../utils/formHelpers"
import SearchSelect from "../components/SearchSelect"
import DataTable from "../components/DataTable"
import Badge from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { Modal } from "../components/ui/Modal"

const emptyForm = { enseignant_id: "", module_id: "", classe_id: "", annee_scolaire: "" }

function validate(data) {
  const errors = {}
  if (!data.enseignant_id)  errors.enseignant_id  = "L'enseignant est requis"
  if (!data.module_id)      errors.module_id      = "Le module est requis"
  if (!data.classe_id)      errors.classe_id      = "La classe est requise"
  if (!data.annee_scolaire.trim()) errors.annee_scolaire = "L'année scolaire est requise"
  else if (!/^\d{4}\/\d{4}$/.test(data.annee_scolaire)) errors.annee_scolaire = "Format invalide. Exemple: 2024/2025"
  return errors
}

function Affectations() {
  const [formData, setFormData]         = useState(emptyForm)
  const [affectations, setAffectations] = useState([])
  const [enseignants, setEnseignants]   = useState([])
  const [modules, setModules]           = useState([])
  const [classes, setClasses]           = useState([])
  const [editId, setEditId]             = useState(null)
  const [message, setMessage]           = useState("")
  const [loading, setLoading]           = useState(true)
  const [errors, setErrors]             = useState({})
  const [showForm, setShowForm]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [filterClasse, setFilterClasse] = useState("")

  useEffect(() => {
    Promise.all([api.get("/affectations"), api.get("/enseignants"), api.get("/modules"), api.get("/classes")]).then(([a, e, m, c]) => {
      setAffectations(a.data); setEnseignants(e.data); setModules(m.data); setClasses(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" })) }
  const resetForm = () => { setFormData(emptyForm); setEditId(null); setErrors({}); setShowForm(false) }
  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 3000) }

  const getEnseignantNom = (id) => { const e = enseignants.find(e => String(e.id) === String(id)); return e ? `${e.nom} ${e.prenom}` : "Inconnu" }
  const getModuleNom = (id) => { const m = modules.find(m => String(m.id) === String(id)); return m ? m.nom_module : "Inconnu" }
  const getClasseNom = (id) => { const c = classes.find(c => String(c.id) === String(id)); return c ? c.nom_classe : "Inconnue" }

  const getLabel = (item) => {
    if (item.enseignant && item.module && item.classe)
      return `${item.enseignant.nom} ${item.enseignant.prenom} — ${item.module.nom_module} — ${item.classe.nom_classe}`
    return `${getEnseignantNom(item.enseignant_id)} — ${getModuleNom(item.module_id)} — ${getClasseNom(item.classe_id)}`
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const clientErrors = validate(formData)
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return }
    setSaving(true)
    try {
      if (editId) {
        const res = await api.put(`/affectations/${editId}`, formData)
        setAffectations(prev => prev.map(i => i.id === editId ? res.data : i))
        showMsg("Affectation modifiée avec succès")
      } else {
        const res = await api.post("/affectations", formData)
        setAffectations(prev => [...prev, res.data])
        showMsg("Affectation ajoutée avec succès")
      }
      resetForm()
    } catch (err) { setErrors(extractErrors(err)) }
    finally { setSaving(false) }
  }

  const handleEdit = (item) => {
    setFormData({ enseignant_id: item.enseignant_id, module_id: item.module_id, classe_id: item.classe_id, annee_scolaire: item.annee_scolaire })
    setEditId(item.id); setErrors({}); setShowForm(true)
  }
  const handleDelete = async (row) => {
    await api.delete(`/affectations/${row.id}`)
    setAffectations(prev => prev.filter(i => i.id !== row.id))
    if (editId === row.id) resetForm()
  }

  const enriched = affectations.map(a => ({
    ...a,
    enseignant_nom: a.enseignant ? `${a.enseignant.nom} ${a.enseignant.prenom}` : getEnseignantNom(a.enseignant_id),
    module_nom:     a.module  ? a.module.nom_module  : getModuleNom(a.module_id),
    classe_nom:     a.classe  ? a.classe.nom_classe  : getClasseNom(a.classe_id),
  }))
  const filtered = filterClasse ? enriched.filter(a => String(a.classe_id) === filterClasse) : enriched

  const columns = [
    { key: "enseignant_nom", label: "Enseignant" },
    { key: "module_nom",     label: "Module",  render: v => <Badge variant="orange">{v}</Badge> },
    { key: "classe_nom",     label: "Classe",  render: v => <Badge variant="blue">{v}</Badge> },
    { key: "annee_scolaire", label: "Année"    },
  ]

  const exportItems = [
    { label: "Export Excel", onClick: () => exportToExcel(affectations.map(i => ({ Enseignant: getLabel(i).split(" — ")[0], Module: getLabel(i).split(" — ")[1], Classe: getLabel(i).split(" — ")[2], Année: i.annee_scolaire })), "affectations.xlsx", "Affectations") },
    { label: "Export PDF",   onClick: () => exportToPDF("Liste des Affectations", ["Enseignant","Module","Classe","Année scolaire"], affectations.map(i => [getLabel(i).split(" — ")[0], getLabel(i).split(" — ")[1], getLabel(i).split(" — ")[2], i.annee_scolaire]), "affectations.pdf") },
  ]

  const addIcon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

  const filtersJSX = (
    <select className="ui-filter-select" value={filterClasse} onChange={e => setFilterClasse(e.target.value)} aria-label="Filtrer par classe">
      <option value="">Toutes les classes</option>
      {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
    </select>
  )

  return (
    <div className="container-fluid">
      <div className="page-header-bar">
        <div className="page-header-left">
          <h1 className="page-header-title">Gestion des Affectations</h1>
          <p className="page-header-desc">Lier enseignants, modules et classes</p>
        </div>
        <div className="page-header-right">
          <span className="page-count-badge">{affectations.length} affectations</span>
          <Button variant="primary" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>
            Ajouter une affectation
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
        title={editId ? "Modifier une affectation" : "Ajouter une affectation"}
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
            <label className="label-muted">Enseignant</label>
            <SearchSelect options={enseignants.map(e => ({ value: e.id, label: `${e.nom} ${e.prenom}` }))} value={formData.enseignant_id} onChange={v => { setFormData(p => ({ ...p, enseignant_id: v })); setErrors(p => ({ ...p, enseignant_id: "" })) }} placeholder="Choisir un enseignant" />
            <FieldError errors={errors} field="enseignant_id" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Module</label>
            <SearchSelect options={modules.map(m => ({ value: m.id, label: m.nom_module }))} value={formData.module_id} onChange={v => { setFormData(p => ({ ...p, module_id: v })); setErrors(p => ({ ...p, module_id: "" })) }} placeholder="Choisir un module" />
            <FieldError errors={errors} field="module_id" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Classe</label>
            <SearchSelect options={classes.map(c => ({ value: c.id, label: c.nom_classe }))} value={formData.classe_id} onChange={v => { setFormData(p => ({ ...p, classe_id: v })); setErrors(p => ({ ...p, classe_id: "" })) }} placeholder="Choisir une classe" />
            <FieldError errors={errors} field="classe_id" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label className="label-muted">Année scolaire</label>
            <input type="text" className={`form-control ${errors.annee_scolaire ? "is-invalid" : ""}`} name="annee_scolaire" value={formData.annee_scolaire} onChange={handleChange} placeholder="2025/2026" />
            <FieldError errors={errors} field="annee_scolaire" />
          </div>
        </form>
      </Modal>

      <DataTable
        title="Liste des affectations"
        columns={columns}
        data={filtered}
        loading={loading}
        emptyText="Aucune affectation trouvée."
        searchKeys={["enseignant_nom", "module_nom", "classe_nom", "annee_scolaire"]}
        filters={filtersJSX}
        exportItems={exportItems}
        topRight={<Button variant="primary" size="sm" icon={addIcon} onClick={() => { resetForm(); setShowForm(true) }}>Ajouter</Button>}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Affectations
