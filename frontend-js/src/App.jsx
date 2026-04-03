import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import ProtectedRoute from "./components/ProtectedRoute"

import Login          from "./pages/Login"
import Dashboard      from "./pages/Dashboard"
import Classes        from "./pages/Classes"
import Etudiants      from "./pages/Etudiants"
import Modules        from "./pages/Modules"
import Enseignants    from "./pages/Enseignants"
import Affectations   from "./pages/Affectations"
import Seances        from "./pages/Seances"
import Absences       from "./pages/Absences"
import Avertissements from "./pages/Avertissements"
import RapportEtudiant from "./pages/RapportEtudiant"
import RapportClasse   from "./pages/RapportClasse"
import SaisieAbsences  from "./pages/SaisieAbsences"
import FeuillePresence  from "./pages/FeuillePresence"
import MesEtudiants     from "./pages/MesEtudiants"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index                      element={<Dashboard />} />
          <Route path="classes"             element={<Classes />} />
          <Route path="etudiants"           element={<Etudiants />} />
          <Route path="modules"             element={<Modules />} />
          <Route path="enseignants"         element={<Enseignants />} />
          <Route path="affectations"        element={<Affectations />} />
          <Route path="seances"             element={<Seances />} />
          <Route path="absences"            element={<Absences />} />
          <Route path="avertissements"      element={<Avertissements />} />
          <Route path="rapport-etudiant"    element={<RapportEtudiant />} />
          <Route path="rapport-classe"      element={<RapportClasse />} />
          <Route path="saisie-absences"     element={<SaisieAbsences />} />
          <Route path="feuille-presence"    element={<FeuillePresence />} />
          <Route path="mes-etudiants"       element={<MesEtudiants />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App