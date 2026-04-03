import jsPDF from "jspdf"

export async function generateAvertissementPDF({ etudiant, taux, niveau }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const PW = 210
  const PH = 297
  const ML = 20
  const MR = 20
  const TW = PW - ML - MR

  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })

  // ── Colors ────────────────────────────────────────────────────────────
  const DARK_BLUE = [26, 54, 93]
  const RED       = [200, 0, 0]
  const BLACK     = [0, 0, 0]
  const GRAY      = [80, 80, 80]
  const WHITE     = [255, 255, 255]
  const EPG_BLUE  = [26, 54, 93]
  const EPG_ORA   = [214, 100, 0]

  // Load logo as base64
  let logoBase64 = null
  try {
    const resp = await fetch("/logo.jpg")
    if (resp.ok) {
      const blob = await resp.blob()
      logoBase64 = await new Promise((res) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result)
        reader.readAsDataURL(blob)
      })
    }
  } catch { logoBase64 = null }

  // ── Helpers ───────────────────────────────────────────────────────────
  const b  = () => doc.setFont("helvetica", "bold")
  const n  = () => doc.setFont("helvetica", "normal")
  const it = () => doc.setFont("helvetica", "italic")
  const bi = () => doc.setFont("helvetica", "bolditalic")
  const sz = (s) => doc.setFontSize(s)
  const tc = ([r, g, bl]) => doc.setTextColor(r, g, bl)

  // ══════════════════════════════════════════════════════════════════════
  // HEADER ROW 1 — logo area (left) + school name (right)
  // ══════════════════════════════════════════════════════════════════════
  let y = 8

  // Left box border (logo area)
  doc.setDrawColor(...DARK_BLUE)
  doc.setLineWidth(0.8)
  doc.rect(ML, y, 42, 28)

  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", ML + 1, y + 1, 40, 26)
  } else {
    b(); sz(18); tc(EPG_BLUE)
    doc.text("E", ML + 3, y + 12)
    tc(EPG_ORA)
    doc.text("P", ML + 11, y + 12)
    tc(EPG_BLUE)
    doc.text("G", ML + 19, y + 12)
    n(); sz(6.5); tc(DARK_BLUE)
    doc.text("Ecole", ML + 28, y + 6)
    doc.text("Polytechnique", ML + 28, y + 10)
    doc.text("Des Génies", ML + 28, y + 14)
  }

  // Try to embed actual logo image
  try {
    // Logo already rendered above via logoBase64.
  } catch {
    // Fallback: EPG letters
    b(); sz(18); tc(EPG_BLUE)
    doc.text("E", ML + 3, y + 12)
    tc(EPG_ORA)
    doc.text("P", ML + 11, y + 12)
    tc(EPG_BLUE)
    doc.text("G", ML + 19, y + 12)
    n(); sz(6.5); tc(DARK_BLUE)
    doc.text("Ecole", ML + 28, y + 6)
    doc.text("Polytechnique", ML + 28, y + 10)
    doc.text("Des Génies", ML + 28, y + 14)
  }

  // School name — right side, large colored
  // "E" blue, "cole " normal, "P" orange, "olytechnique " normal, "d" blue, "es " normal, "G" orange, "énies" normal
  const nameX = ML + 50
  const nameY = y + 16
  sz(20)

  b(); tc(EPG_BLUE);  doc.text("E", nameX, nameY)
  const wE = doc.getTextWidth("E")
  n(); tc(BLACK);     doc.text("cole ", nameX + wE, nameY)
  const wCole = doc.getTextWidth("cole ")
  b(); tc(EPG_ORA);   doc.text("P", nameX + wE + wCole, nameY)
  const wP = doc.getTextWidth("P")
  n(); tc(BLACK);     doc.text("olytechnique des ", nameX + wE + wCole + wP, nameY)
  const wOly = doc.getTextWidth("olytechnique des ")
  b(); tc(EPG_BLUE);  doc.text("G", nameX + wE + wCole + wP + wOly, nameY)
  const wG = doc.getTextWidth("G")
  n(); tc(BLACK);     doc.text("énies", nameX + wE + wCole + wP + wOly + wG, nameY)

  y += 30

  // ══════════════════════════════════════════════════════════════════════
  // DARK BLUE BANNER — establishment info
  // ══════════════════════════════════════════════════════════════════════
  doc.setFillColor(...DARK_BLUE)
  doc.rect(0, y, PW, 18, "F")

  tc(WHITE); sz(8.5)
  b(); doc.text("Établissement :", ML + 35, y + 6)
  n(); doc.text(" Ecole Polytechnique des Génies « Établissement Privé »", ML + 35 + doc.getTextWidth("Établissement :"), y + 6)
  b(); doc.text("Adresse :", ML + 35, y + 12)
  n(); doc.text(" 22 RUE MOHAMMED HAYANI V.N IMB HAZZAZ ETAGE 4 APP 20", ML + 35 + doc.getTextWidth("Adresse :"), y + 12)

  y += 24

  // ══════════════════════════════════════════════════════════════════════
  // TITLE — red, centered, bold
  // ══════════════════════════════════════════════════════════════════════
  b(); sz(16); tc(RED)
  doc.text("DEUXIÈME AVERTISSEMENT", PW / 2, y, { align: "center" })
  y += 16

  // ══════════════════════════════════════════════════════════════════════
  // BODY
  // ══════════════════════════════════════════════════════════════════════
  sz(10.5); tc(BLACK)

  // "À l'attention de :"
  b(); doc.text("À l'attention de :", ML, y)
  y += 6

  // "Monsieur NOM PRENOM"
  n(); doc.text("Monsieur ", ML, y)
  b(); doc.text(`${etudiant.nom.toUpperCase()} ${etudiant.prenom}`, ML + doc.getTextWidth("Monsieur "), y)
  y += 7

  // Paragraph 1 — with inline bold
  // "Suite à un premier avertissement professionnel déjà adressé..."
  const renderMixedLine = (parts, x, yPos) => {
    let cx = x
    parts.forEach(([text, bold]) => {
      if (bold) b(); else n()
      doc.text(text, cx, yPos)
      cx += doc.getTextWidth(text)
    })
    return cx
  }

  // P1 — split into lines manually using splitTextToSize for plain text width estimation
  n(); sz(10.5)
  const p1 = doc.splitTextToSize(
    "Suite à un premier avertissement professionnel déjà adressé concernant vos absences répétées aux séances de cours sans justification valable, nous constatons que la situation persiste malgré nos rappels à l'ordre.",
    TW
  )
  // Render with bold on key phrases
  p1.forEach(line => {
    if (line.includes("premier avertissement professionnel")) {
      const idx = line.indexOf("premier avertissement professionnel")
      const before = line.substring(0, idx)
      const bold   = "premier avertissement professionnel"
      const after  = line.substring(idx + bold.length)
      let cx = ML
      n(); doc.text(before, cx, y); cx += doc.getTextWidth(before)
      b(); doc.text(bold, cx, y);   cx += doc.getTextWidth(bold)
      n(); doc.text(after, cx, y)
    } else if (line.includes("sans justification valable")) {
      const idx = line.indexOf("sans justification valable")
      const before = line.substring(0, idx)
      const bold   = "sans justification valable"
      const after  = line.substring(idx + bold.length)
      let cx = ML
      n(); doc.text(before, cx, y); cx += doc.getTextWidth(before)
      b(); doc.text(bold, cx, y);   cx += doc.getTextWidth(bold)
      n(); doc.text(after, cx, y)
    } else {
      n(); doc.text(line, ML, y)
    }
    y += 5.8
  })
  y += 3

  // P2
  const p2 = doc.splitTextToSize(
    "Ces absences non justifiées continuent de nuire à votre progression pédagogique et au bon déroulement des apprentissages au sein du groupe.",
    TW
  )
  n(); doc.text(p2, ML, y)
  y += p2.length * 5.8 + 5

  // P3 — "présence régulière aux cours" bold, "obligatoire" bold, "validation de votre formation" bold
  const p3lines = doc.splitTextToSize(
    "Nous vous rappelons une nouvelle fois que la présence régulière aux cours est obligatoire et conditionne la validation de votre formation.",
    TW
  )
  p3lines.forEach(line => {
    const boldPhrases = ["présence régulière aux cours", "obligatoire", "validation de votre formation"]
    let remaining = line
    let cx = ML
    while (remaining.length > 0) {
      let found = false
      for (const phrase of boldPhrases) {
        if (remaining.startsWith(phrase)) {
          b(); doc.text(phrase, cx, y); cx += doc.getTextWidth(phrase)
          remaining = remaining.substring(phrase.length)
          found = true; break
        }
      }
      if (!found) {
        // find next bold phrase position
        let nextIdx = remaining.length
        let nextPhrase = ""
        for (const phrase of boldPhrases) {
          const idx = remaining.indexOf(phrase)
          if (idx !== -1 && idx < nextIdx) { nextIdx = idx; nextPhrase = phrase }
        }
        const normalPart = remaining.substring(0, nextIdx)
        n(); doc.text(normalPart, cx, y); cx += doc.getTextWidth(normalPart)
        remaining = remaining.substring(nextIdx)
      }
    }
    y += 5.8
  })
  y += 3

  // P4 — "deuxième avertissement" bold, "manquement répété à l'assiduité" bold
  const p4lines = doc.splitTextToSize(
    "En conséquence, et conformément au règlement intérieur de l'établissement, nous vous adressons par la présente un deuxième avertissement pour manquement répété à l'assiduité.",
    TW
  )
  p4lines.forEach(line => {
    const boldPhrases = ["deuxième avertissement", "manquement répété à", "l'assiduité"]
    let remaining = line
    let cx = ML
    while (remaining.length > 0) {
      let found = false
      for (const phrase of boldPhrases) {
        if (remaining.startsWith(phrase)) {
          b(); doc.text(phrase, cx, y); cx += doc.getTextWidth(phrase)
          remaining = remaining.substring(phrase.length)
          found = true; break
        }
      }
      if (!found) {
        let nextIdx = remaining.length
        for (const phrase of boldPhrases) {
          const idx = remaining.indexOf(phrase)
          if (idx !== -1 && idx < nextIdx) nextIdx = idx
        }
        const normalPart = remaining.substring(0, nextIdx)
        n(); doc.text(normalPart, cx, y); cx += doc.getTextWidth(normalPart)
        remaining = remaining.substring(nextIdx)
      }
    }
    y += 5.8
  })
  y += 3

  // P5 — "mesure administrative ou pédagogique" bold, "suspension temporaire de participation aux cours ou aux évaluations" bold
  const p5lines = doc.splitTextToSize(
    "Nous vous invitons à faire preuve de rigueur et de responsabilité afin d'éviter toute mesure administrative ou pédagogique, pouvant aller jusqu'à une suspension temporaire de participation aux cours ou aux évaluations, selon la gravité de la situation.",
    TW
  )
  p5lines.forEach(line => {
    const boldPhrases = [
      "mesure administrative ou pédagogique",
      "suspension temporaire de",
      "participation aux cours ou aux évaluations",
    ]
    let remaining = line
    let cx = ML
    while (remaining.length > 0) {
      let found = false
      for (const phrase of boldPhrases) {
        if (remaining.startsWith(phrase)) {
          b(); doc.text(phrase, cx, y); cx += doc.getTextWidth(phrase)
          remaining = remaining.substring(phrase.length)
          found = true; break
        }
      }
      if (!found) {
        let nextIdx = remaining.length
        for (const phrase of boldPhrases) {
          const idx = remaining.indexOf(phrase)
          if (idx !== -1 && idx < nextIdx) nextIdx = idx
        }
        const normalPart = remaining.substring(0, nextIdx)
        n(); doc.text(normalPart, cx, y); cx += doc.getTextWidth(normalPart)
        remaining = remaining.substring(nextIdx)
      }
    }
    y += 5.8
  })
  y += 8

  // "École Polytechnique des Génies"
  b(); sz(10.5); tc(BLACK)
  doc.text("École Polytechnique des Génies", ML, y)
  y += 20

  // ══════════════════════════════════════════════════════════════════════
  // SIGNATURE — right aligned
  // ══════════════════════════════════════════════════════════════════════
  b(); sz(11); tc(BLACK)
  doc.text(`Fait à Fès, le ${today}`, PW - MR, y, { align: "right" })
  y += 7

  it(); sz(10.5); tc(BLACK)
  doc.text("La Direction des Études et du Suivi Pédagogique", PW - MR, y, { align: "right" })

  // ══════════════════════════════════════════════════════════════════════
  // FOOTER BAR
  // ══════════════════════════════════════════════════════════════════════
  const fy = PH - 20
  doc.setFillColor(...DARK_BLUE)
  doc.rect(0, fy, PW, 20, "F")

  tc(WHITE); n(); sz(7.5)
  doc.text(
    "22 RUE MOHAMMED HAYANI V.N. ETAGE 4 APP 20 IMM HAZZAZ  30100 FES MAROC",
    PW / 2, fy + 5, { align: "center" }
  )
  doc.text(
    "Fixe : 05 35 62 15 68       Tél : 06 19 08 66 66       Email : contact@epg.ma",
    PW / 2, fy + 10, { align: "center" }
  )
  doc.text(
    "IF: 14466362   |   TP: 13680570   |   RC: 79046   |   ICE N°: 000558132000065        www.epg.ma",
    PW / 2, fy + 15, { align: "center" }
  )

  doc.save(`avertissement_${etudiant.nom}_${etudiant.prenom}.pdf`)
}
