import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToExcel(data, fileName = "export.xlsx", sheetName = "Sheet1") {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}

export function exportToPDF(title, columns, rows, fileName = "export.pdf") {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(title, 14, 15)

  autoTable(doc, {
    startY: 25,
    head: [columns],
    body: rows,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
    },
  })

  doc.save(fileName)
}