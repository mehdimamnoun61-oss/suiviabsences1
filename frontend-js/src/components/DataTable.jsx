import { useState, useMemo } from "react"
import { ConfirmModal } from "./ui/Modal"
import { SearchInput } from "./ui/Input"
import { Dropdown } from "./ui/Dropdown"

const PER_PAGE = 10

/**
 * DataTable — unified reusable table component
 *
 * Props:
 *   title        string
 *   columns      [{ key, label, render?, sortable?, width? }]
 *   data         array of objects
 *   loading      bool
 *   emptyText    string
 *   searchKeys   [string]
 *   filters      JSX  — extra filter controls rendered in topbar
 *   topRight     JSX  — "Add New" button area
 *   exportItems  [{ label, icon, onClick }]  — export dropdown items
 *   onEdit       (row) => void
 *   onDelete     (row) => void
 *   onView       (row) => void
 *   rowKey       string  — field used as React key (default "id")
 */
function DataTable({
  title,
  columns = [],
  data = [],
  loading = false,
  emptyText = "Aucune donnée trouvée.",
  searchKeys = [],
  filters,
  topRight,
  exportItems = [],
  onEdit,
  onDelete,
  onView,
  rowKey = "id",
}) {
  const [search,    setSearch]    = useState("")
  const [sortKey,   setSortKey]   = useState(null)
  const [sortDir,   setSortDir]   = useState("asc")
  const [page,      setPage]      = useState(1)
  const [deleteRow, setDeleteRow] = useState(null)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let rows = [...data]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(row =>
        searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q))
      )
    }
    if (sortKey) {
      rows.sort((a, b) => {
        const av = String(a[sortKey] ?? "").toLowerCase()
        const bv = String(b[sortKey] ?? "").toLowerCase()
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    }
    return rows
  }, [data, search, sortKey, sortDir, searchKeys])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const hasActions = onEdit || onDelete || onView

  const exportIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  return (
    <div className="dt-wrapper">
      {/* ── Top bar ── */}
      <div className="dt-topbar">
        <div className="dt-topbar-left">
          {title && <h2 className="dt-title">{title}</h2>}
          <SearchInput
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          {filters && <div className="dt-filters">{filters}</div>}
        </div>

        <div className="dt-topbar-right">
          {exportItems.length > 0 && (
            <Dropdown
              align="right"
              trigger={
                <button className="ui-btn ui-btn-secondary ui-btn-md" aria-label="Exporter">
                  <span className="ui-btn-icon" aria-hidden="true">{exportIcon}</span>
                  <span>Exporter</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }} aria-hidden="true">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              }
              items={exportItems}
            />
          )}
          {topRight}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="dt-table-wrap" role="region" aria-label={title || "Tableau de données"}>
        {loading ? (
          <div className="dt-skeleton" aria-busy="true" aria-label="Chargement...">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="dt-skeleton-row">
                {[...Array(columns.length + (hasActions ? 1 : 0))].map((_, j) => (
                  <div key={j} className="dt-skeleton-cell" style={{ animationDelay: `${i * 0.07}s` }} />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="dt-empty" role="status">
            <div className="dt-empty-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p className="dt-empty-title">Aucun résultat</p>
            <p className="dt-empty-sub">{emptyText}</p>
          </div>
        ) : (
          <div className="dt-scroll">
            <table className="dt-table" role="table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={col.sortable !== false ? "dt-th-sortable" : ""}
                      style={col.width ? { width: col.width } : {}}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                      scope="col"
                    >
                      <span className="dt-th-inner">
                        {col.label}
                        {col.sortable !== false && (
                          <span className="dt-sort-icon" aria-hidden="true">
                            {sortKey === col.key
                              ? sortDir === "asc"
                                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2l4 6H1z" fill="currentColor"/></svg>
                                : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8L1 2h8z" fill="currentColor"/></svg>
                              : <svg width="10" height="10" viewBox="0 0 10 10" fill="none" opacity=".4"><path d="M5 1l3 4H2zM5 9L2 5h6z" fill="currentColor"/></svg>
                            }
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {hasActions && <th className="dt-th-actions" scope="col">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr key={row[rowKey] ?? i} className="dt-row" tabIndex={0}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="dt-actions-cell">
                        <div className="dt-actions">
                          {onView && (
                            <button
                              className="dt-action-btn dt-action-view"
                              title="Voir"
                              aria-label="Voir"
                              onClick={() => onView(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                          )}
                          {onEdit && (
                            <button
                              className="dt-action-btn dt-action-edit"
                              title="Modifier"
                              aria-label="Modifier"
                              onClick={() => onEdit(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                          )}
                          {onDelete && (
                            <button
                              className="dt-action-btn dt-action-delete"
                              title="Supprimer"
                              aria-label="Supprimer"
                              onClick={() => setDeleteRow(row)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="dt-pagination" role="navigation" aria-label="Pagination">
          <span className="dt-pagination-info">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length}
          </span>
          <div className="dt-pagination-btns">
            <button className="dt-page-btn" disabled={page === 1} onClick={() => setPage(1)} aria-label="Première page">«</button>
            <button className="dt-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Page précédente">‹</button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  className={`dt-page-btn ${page === p ? "dt-page-active" : ""}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            })}
            <button className="dt-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} aria-label="Page suivante">›</button>
            <button className="dt-page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)} aria-label="Dernière page">»</button>
          </div>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      <ConfirmModal
        open={deleteRow !== null}
        onClose={() => setDeleteRow(null)}
        onConfirm={() => { onDelete?.(deleteRow); setDeleteRow(null) }}
      />
    </div>
  )
}

export default DataTable
