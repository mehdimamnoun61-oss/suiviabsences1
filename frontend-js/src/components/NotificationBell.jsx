import { useMemo } from "react"

function NotificationBell() {
  const absences = JSON.parse(localStorage.getItem("absences")) || []
  const etudiants = JSON.parse(localStorage.getItem("etudiants")) || []

  const notifications = useMemo(() => {
    const compteur = {}

    absences.forEach((absence) => {
      if (absence.statut === "Absent") {
        compteur[absence.etudiant_id] = (compteur[absence.etudiant_id] || 0) + 1
      }
    })

    return etudiants
      .map((etudiant) => ({
        id: etudiant.id,
        nom: `${etudiant.nom} ${etudiant.prenom}`,
        total: compteur[etudiant.id] || 0,
      }))
      .filter((item) => item.total >= 2)
  }, [absences, etudiants])

  return (
    <div className="dropdown">
      <button className="btn btn-outline-dark position-relative" type="button" data-bs-toggle="dropdown">
        Notifications
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>

      <ul className="dropdown-menu dropdown-menu-end shadow" style={{ width: "320px" }}>
        <li className="dropdown-header fw-bold">Notifications</li>

        {notifications.length === 0 ? (
          <li className="px-3 py-2 text-muted">Aucune notification</li>
        ) : (
          notifications.map((item) => (
            <li key={item.id} className="px-3 py-2 border-bottom">
              <div className="fw-semibold">{item.nom}</div>
              <small className="text-danger">
                {item.total} absences - avertissement requis
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default NotificationBell