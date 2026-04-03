/**
 * SearchInput — search bar with icon and clear button
 */
export function SearchInput({ value, onChange, placeholder = "Rechercher...", className = "" }) {
  return (
    <div className={`ui-search-input ${className}`}>
      <svg className="ui-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="ui-search-field"
        aria-label={placeholder}
      />
      {value && (
        <button
          className="ui-search-clear"
          onClick={() => onChange({ target: { value: "" } })}
          aria-label="Effacer la recherche"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}

export default SearchInput
