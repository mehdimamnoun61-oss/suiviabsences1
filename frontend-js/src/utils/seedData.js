/**
 * seedData.js
 * زيد هاد الملف في src/utils/seedData.js
 * كيملا localStorage بداتا تجريبية كاملة
 */

export function seedTestData() {
  // ── Classes ──────────────────────────────────────────────────────────────
  const classes = [
    { id: 1, nom_classe: "GI-1", filiere: "Génie Informatique", niveau: "1ère année", groupe: "A", annee_scolaire: "2024/2025" },
    { id: 2, nom_classe: "GI-2", filiere: "Génie Informatique", niveau: "2ème année", groupe: "B", annee_scolaire: "2024/2025" },
    { id: 3, nom_classe: "GC-1", filiere: "Génie Civil",        niveau: "1ère année", groupe: "A", annee_scolaire: "2024/2025" },
  ]

  // ── Étudiants ─────────────────────────────────────────────────────────────
  const etudiants = [
    { id: 101, nom: "Alami",    prenom: "Youssef",  tel: "0612000001", date_naissance: "2002-03-15", sex: "homme", email: "youssef.alami@epg.ma",    classe_id: 1 },
    { id: 102, nom: "Benali",   prenom: "Fatima",   tel: "0612000002", date_naissance: "2002-07-22", sex: "femme", email: "fatima.benali@epg.ma",    classe_id: 1 },
    { id: 103, nom: "Chakir",   prenom: "Omar",     tel: "0612000003", date_naissance: "2001-11-05", sex: "homme", email: "omar.chakir@epg.ma",      classe_id: 1 },
    { id: 104, nom: "Darif",    prenom: "Salma",    tel: "0612000004", date_naissance: "2002-01-30", sex: "femme", email: "salma.darif@epg.ma",      classe_id: 2 },
    { id: 105, nom: "El Fassi", prenom: "Hamza",    tel: "0612000005", date_naissance: "2001-09-18", sex: "homme", email: "hamza.elfassi@epg.ma",    classe_id: 2 },
    { id: 106, nom: "Filali",   prenom: "Nadia",    tel: "0612000006", date_naissance: "2002-05-12", sex: "femme", email: "nadia.filali@epg.ma",     classe_id: 2 },
    { id: 107, nom: "Ghazi",    prenom: "Anas",     tel: "0612000007", date_naissance: "2001-08-25", sex: "homme", email: "anas.ghazi@epg.ma",       classe_id: 3 },
    { id: 108, nom: "Hajji",    prenom: "Rim",      tel: "0612000008", date_naissance: "2002-04-09", sex: "femme", email: "rim.hajji@epg.ma",        classe_id: 3 },
  ]

  // ── Enseignants ───────────────────────────────────────────────────────────
  const enseignants = [
    { id: 201, nom: "Idrissi",  prenom: "Karim",   email: "k.idrissi@epg.ma",  tel: "0661000001", specialite: "Programmation Web"    },
    { id: 202, nom: "Jebari",   prenom: "Sanaa",   email: "s.jebari@epg.ma",   tel: "0661000002", specialite: "Bases de données"     },
    { id: 203, nom: "Karimi",   prenom: "Rachid",  email: "r.karimi@epg.ma",   tel: "0661000003", specialite: "Mathématiques"        },
    { id: 204, nom: "Lahlou",   prenom: "Amina",   email: "a.lahlou@epg.ma",   tel: "0661000004", specialite: "Génie Civil"          },
  ]

  // ── Modules ───────────────────────────────────────────────────────────────
  const modules = [
    { id: 301, nom_module: "Programmation Web",     volume_horaire: 40 },
    { id: 302, nom_module: "Bases de données",      volume_horaire: 35 },
    { id: 303, nom_module: "Mathématiques",         volume_horaire: 45 },
    { id: 304, nom_module: "Résistance des matériaux", volume_horaire: 30 },
  ]

  // ── Affectations ──────────────────────────────────────────────────────────
  const affectations = [
    { id: 401, enseignant_id: 201, module_id: 301, classe_id: 1, annee_scolaire: "2024/2025" },
    { id: 402, enseignant_id: 202, module_id: 302, classe_id: 1, annee_scolaire: "2024/2025" },
    { id: 403, enseignant_id: 203, module_id: 303, classe_id: 2, annee_scolaire: "2024/2025" },
    { id: 404, enseignant_id: 204, module_id: 304, classe_id: 3, annee_scolaire: "2024/2025" },
  ]

  // ── Séances ───────────────────────────────────────────────────────────────
  const seances = [
    // GI-1 — Prog Web (affectation 401)
    { id: 501, affectation_id: 401, date_seance: "2024-10-07", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 502, affectation_id: 401, date_seance: "2024-10-14", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 503, affectation_id: 401, date_seance: "2024-10-21", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 504, affectation_id: 401, date_seance: "2024-10-28", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 505, affectation_id: 401, date_seance: "2024-11-04", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 506, affectation_id: 401, date_seance: "2024-11-11", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 507, affectation_id: 401, date_seance: "2024-11-18", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 508, affectation_id: 401, date_seance: "2024-11-25", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 509, affectation_id: 401, date_seance: "2024-12-02", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    { id: 510, affectation_id: 401, date_seance: "2024-12-09", heure_debut: "08:00", heure_fin: "10:00", duree: 120, statut: "Terminée" },
    // GI-1 — BDD (affectation 402)
    { id: 511, affectation_id: 402, date_seance: "2024-10-08", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 512, affectation_id: 402, date_seance: "2024-10-15", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 513, affectation_id: 402, date_seance: "2024-10-22", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 514, affectation_id: 402, date_seance: "2024-10-29", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 515, affectation_id: 402, date_seance: "2024-11-05", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 516, affectation_id: 402, date_seance: "2024-11-12", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 517, affectation_id: 402, date_seance: "2024-11-19", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    { id: 518, affectation_id: 402, date_seance: "2024-11-26", heure_debut: "10:00", heure_fin: "12:00", duree: 120, statut: "Terminée" },
    // GI-2 — Maths (affectation 403)
    { id: 521, affectation_id: 403, date_seance: "2024-10-09", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    { id: 522, affectation_id: 403, date_seance: "2024-10-16", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    { id: 523, affectation_id: 403, date_seance: "2024-10-23", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    { id: 524, affectation_id: 403, date_seance: "2024-10-30", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    { id: 525, affectation_id: 403, date_seance: "2024-11-06", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    { id: 526, affectation_id: 403, date_seance: "2024-11-13", heure_debut: "14:00", heure_fin: "16:00", duree: 120, statut: "Terminée" },
    // GC-1 — RDM (affectation 404)
    { id: 531, affectation_id: 404, date_seance: "2024-10-10", heure_debut: "09:00", heure_fin: "11:00", duree: 120, statut: "Terminée" },
    { id: 532, affectation_id: 404, date_seance: "2024-10-17", heure_debut: "09:00", heure_fin: "11:00", duree: 120, statut: "Terminée" },
    { id: 533, affectation_id: 404, date_seance: "2024-10-24", heure_debut: "09:00", heure_fin: "11:00", duree: 120, statut: "Terminée" },
    { id: 534, affectation_id: 404, date_seance: "2024-10-31", heure_debut: "09:00", heure_fin: "11:00", duree: 120, statut: "Terminée" },
    { id: 535, affectation_id: 404, date_seance: "2024-11-07", heure_debut: "09:00", heure_fin: "11:00", duree: 120, statut: "Terminée" },
  ]

  // ── Absences ──────────────────────────────────────────────────────────────
  // GI-1: 10 séances prog web + 8 séances BDD = 18 séances total pour Youssef/Fatima/Omar
  const absences = [
    // Youssef (101) — taux ~35% → CONVOCATION
    { id: 601, etudiant_id: 101, seance_id: 501, statut: "Absent", justifie: "non" },
    { id: 602, etudiant_id: 101, seance_id: 502, statut: "Absent", justifie: "non" },
    { id: 603, etudiant_id: 101, seance_id: 503, statut: "Absent", justifie: "oui" },
    { id: 604, etudiant_id: 101, seance_id: 511, statut: "Absent", justifie: "non" },
    { id: 605, etudiant_id: 101, seance_id: 512, statut: "Absent", justifie: "non" },
    { id: 606, etudiant_id: 101, seance_id: 513, statut: "Retard", justifie: "non" },
    { id: 607, etudiant_id: 101, seance_id: 514, statut: "Absent", justifie: "non" },

    // Fatima (102) — taux ~22% → AVERTISSEMENT
    { id: 611, etudiant_id: 102, seance_id: 504, statut: "Absent", justifie: "non" },
    { id: 612, etudiant_id: 102, seance_id: 505, statut: "Absent", justifie: "oui" },
    { id: 613, etudiant_id: 102, seance_id: 511, statut: "Retard", justifie: "non" },
    { id: 614, etudiant_id: 102, seance_id: 515, statut: "Absent", justifie: "non" },
    { id: 615, etudiant_id: 102, seance_id: 516, statut: "Retard", justifie: "non" },

    // Omar (103) — taux ~12% → OBSERVATION
    { id: 621, etudiant_id: 103, seance_id: 506, statut: "Absent", justifie: "non" },
    { id: 622, etudiant_id: 103, seance_id: 512, statut: "Retard", justifie: "non" },
    { id: 623, etudiant_id: 103, seance_id: 517, statut: "Retard", justifie: "oui" },

    // Hamza (105) — taux ~34% → CONVOCATION
    { id: 631, etudiant_id: 105, seance_id: 521, statut: "Absent", justifie: "non" },
    { id: 632, etudiant_id: 105, seance_id: 522, statut: "Absent", justifie: "non" },
    { id: 633, etudiant_id: 105, seance_id: 523, statut: "Absent", justifie: "non" },
    { id: 634, etudiant_id: 105, seance_id: 524, statut: "Retard", justifie: "non" },

    // Nadia (106) — taux ~17% → OBSERVATION
    { id: 641, etudiant_id: 106, seance_id: 521, statut: "Retard", justifie: "non" },
    { id: 642, etudiant_id: 106, seance_id: 525, statut: "Absent", justifie: "oui" },

    // Anas (107) — taux ~40% → CONVOCATION
    { id: 651, etudiant_id: 107, seance_id: 531, statut: "Absent", justifie: "non" },
    { id: 652, etudiant_id: 107, seance_id: 532, statut: "Absent", justifie: "non" },
    { id: 653, etudiant_id: 107, seance_id: 533, statut: "Absent", justifie: "non" },
    { id: 654, etudiant_id: 107, seance_id: 534, statut: "Retard", justifie: "non" },

    // Rim (108) — taux ~20% → AVERTISSEMENT
    { id: 661, etudiant_id: 108, seance_id: 531, statut: "Absent", justifie: "non" },
    { id: 662, etudiant_id: 108, seance_id: 535, statut: "Absent", justifie: "oui" },
  ]

  // ── Sauvegarde dans localStorage ──────────────────────────────────────────
  localStorage.setItem("classes",      JSON.stringify(classes))
  localStorage.setItem("etudiants",    JSON.stringify(etudiants))
  localStorage.setItem("enseignants",  JSON.stringify(enseignants))
  localStorage.setItem("modules",      JSON.stringify(modules))
  localStorage.setItem("affectations", JSON.stringify(affectations))
  localStorage.setItem("seances",      JSON.stringify(seances))
  localStorage.setItem("absences",     JSON.stringify(absences))

  return {
    classes:      classes.length,
    etudiants:    etudiants.length,
    enseignants:  enseignants.length,
    modules:      modules.length,
    affectations: affectations.length,
    seances:      seances.length,
    absences:     absences.length,
  }
}

export function clearAllData() {
  const keys = ["classes","etudiants","enseignants","modules","affectations","seances","absences"]
  keys.forEach((k) => localStorage.removeItem(k))
}