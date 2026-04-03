import jsPDF from "jspdf"

/**
 * Génère un PDF d'avertissement officiel pour un étudiant
 *
 * @param {Object} params
 * @param {Object} params.etudiant  - { nom, prenom, email, classe }
 * @param {Array}  params.modules   - [{ nom_module, volume_horaire }]
 * @param {number} params.taux      - taux d'absence en %
 * @param {string} params.niveau    - "Observation" | "Avertissement" | "Convocation"
 */
export function generateAvertissementPDF({ etudiant, modules, taux, niveau }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })

  const today = new Date().toLocaleDateString("fr-MA", {
    day: "2-digit", month: "long", year: "numeric",
  })

  const primaryColor = [15, 23, 42]    // #0f172a  (sidebar color)
  const accentColor  =
    taux >= 30 ? [220, 38, 38]  :      // rouge  — Convocation
    taux >= 20 ? [249, 115, 22] :      // orange — Avertissement
                 [245, 158, 11]         // jaune  — Observation

  const pageW = 210
  const margin = 20

  // ── En-tête ──────────────────────────────────────────────────────────────
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageW, 35, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("AbsencePro", margin, 15)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Ecole Polytechnique des Génies", margin, 22)
  doc.text("Système de gestion des absences", margin, 28)

  // ── Titre du document ────────────────────────────────────────────────────
  doc.setFillColor(...accentColor)
  doc.rect(0, 35, pageW, 18, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  const titreNiveau =
    niveau === "Convocation"   ? "CONVOCATION POUR ABSENCES RÉPÉTÉES" :
    niveau === "Avertissement" ? "AVERTISSEMENT POUR ABSENCES"        :
                                 "OBSERVATION — TAUX D'ABSENCE ÉLEVÉ"
  doc.text(titreNiveau, pageW / 2, 46, { align: "center" })

  // ── Date et référence ────────────────────────────────────────────────────
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Date : ${today}`, pageW - margin, 60, { align: "right" })
  doc.text(`Réf. : ABS-${etudiant.id}-${Date.now().toString().slice(-5)}`, pageW - margin, 65, { align: "right" })

  // ── Informations étudiant ────────────────────────────────────────────────
  doc.setDrawColor(229, 231, 235)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, 70, pageW - 2 * margin, 42, 4, 4, "FD")

  doc.setTextColor(...primaryColor)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Informations de l'étudiant", margin + 6, 80)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)

  const infoLeft  = margin + 6
  const infoRight = pageW / 2 + 10

  doc.text(`Nom complet :`, infoLeft, 90)
  doc.setFont("helvetica", "bold")
  doc.text(`${etudiant.nom} ${etudiant.prenom}`, infoLeft + 35, 90)

  doc.setFont("helvetica", "normal")
  doc.text(`Classe :`, infoRight, 90)
  doc.setFont("helvetica", "bold")
  doc.text(`${etudiant.classe}`, infoRight + 22, 90)

  doc.setFont("helvetica", "normal")
  doc.text(`Email :`, infoLeft, 99)
  doc.setFont("helvetica", "bold")
  doc.text(`${etudiant.email}`, infoLeft + 20, 99)

  // ── Taux d'absence (visuel) ──────────────────────────────────────────────
  doc.setDrawColor(229, 231, 235)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, 118, pageW - 2 * margin, 30, 4, 4, "FD")

  doc.setTextColor(...primaryColor)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Taux d'absence constaté :", margin + 6, 128)

  // Barre de progression
  const barX = margin + 6
  const barY = 133
  const barW = pageW - 2 * margin - 55
  const barH = 7
  const fillW = Math.min((taux / 100) * barW, barW)

  doc.setFillColor(229, 231, 235)
  doc.roundedRect(barX, barY, barW, barH, 2, 2, "F")

  doc.setFillColor(...accentColor)
  if (fillW > 0) doc.roundedRect(barX, barY, fillW, barH, 2, 2, "F")

  // Valeur numérique
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...accentColor)
  doc.text(`${taux}%`, pageW - margin - 6, 141, { align: "right" })

  // ── Seuils ───────────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(156, 163, 175)
  doc.text("10% Obs.", barX, barY + barH + 5)
  doc.text("20% Avert.", barX + barW * 0.2 - 3, barY + barH + 5)
  doc.text("30% Conv.", barX + barW * 0.3 - 3, barY + barH + 5)

  // ── Corps du message ─────────────────────────────────────────────────────
  let yPos = 158

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...primaryColor)
  doc.text("Madame, Monsieur,", margin, yPos)
  yPos += 10

  doc.setFont("helvetica", "normal")
  doc.setTextColor(55, 65, 81)
  doc.setFontSize(10)

  const corps =
    niveau === "Convocation"
      ? [
          `Nous avons le regret de vous informer que votre taux d'absence a atteint ${taux}%,`,
          `ce qui dépasse largement le seuil maximal autorisé de 30%.`,
          ``,
          `En conséquence, vous êtes convoqué(e) à vous présenter auprès de la direction`,
          `pédagogique dans les plus brefs délais, muni(e) des justificatifs nécessaires.`,
          ``,
          `Le défaut de présentation pourrait entraîner des mesures disciplinaires.`,
        ]
      : niveau === "Avertissement"
      ? [
          `Nous constatons que votre taux d'absence s'élève actuellement à ${taux}%,`,
          `dépassant le seuil d'avertissement fixé à 20%.`,
          ``,
          `Nous vous demandons de régulariser votre situation dans les meilleurs délais`,
          `et de fournir les justificatifs correspondants à votre administration.`,
          ``,
          `Sans amélioration, vous ferez l'objet d'une convocation formelle.`,
        ]
      : [
          `Votre taux d'absence actuel est de ${taux}%, ce qui dépasse le seuil`,
          `d'observation de 10%.`,
          ``,
          `Nous attirons votre attention sur l'importance de la régularité`,
          `dans votre parcours académique.`,
          ``,
          `Nous vous invitons à améliorer votre assiduité afin d'éviter`,
          `un avertissement formel.`,
        ]

  corps.forEach((line) => {
    doc.text(line, margin, yPos)
    yPos += 6
  })

  // ── Modules concernés ────────────────────────────────────────────────────
  if (modules && modules.length > 0) {
    yPos += 4
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Modules concernés :", margin, yPos)
    yPos += 7

    doc.setFont("helvetica", "normal")
    doc.setTextColor(55, 65, 81)
    modules.forEach((m, i) => {
      doc.setFillColor(...accentColor)
      doc.circle(margin + 2, yPos - 1.5, 1.5, "F")
      doc.text(`${m.nom_module}  (Volume horaire : ${m.volume_horaire}h)`, margin + 7, yPos)
      yPos += 6
      if (i > 3) { doc.text("...", margin + 7, yPos); yPos += 6; return false }
    })
  }

  // ── Signature ────────────────────────────────────────────────────────────
  yPos = Math.max(yPos + 10, 240)

  doc.setDrawColor(229, 231, 235)
  doc.line(margin, yPos, pageW - margin, yPos)
  yPos += 8

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(...primaryColor)
  doc.text("La Direction Pédagogique", pageW - margin, yPos, { align: "right" })
  yPos += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text("Ecole Polytechnique des Génies", pageW - margin, yPos, { align: "right" })

  // ── Pied de page ─────────────────────────────────────────────────────────
  doc.setFillColor(...primaryColor)
  doc.rect(0, 285, pageW, 12, "F")
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(
    "Ce document est généré automatiquement par AbsencePro — Ecole Polytechnique des Génies",
    pageW / 2, 292, { align: "center" }
  )

  // ── Sauvegarde ───────────────────────────────────────────────────────────
  const fileName = `avertissement_${etudiant.nom}_${etudiant.prenom}_${today.replace(/ /g, "_")}.pdf`
  doc.save(fileName)
}