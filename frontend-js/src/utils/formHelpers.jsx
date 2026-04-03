/**
 * Extract Laravel validation errors from axios error response
 * Returns flat object: { field: "first error message" }
 */
export function extractErrors(err) {
  const data = err?.response?.data
  if (!data) return {}
  // Laravel 422 returns { errors: { field: ["msg"] } }
  if (data.errors) {
    return Object.fromEntries(
      Object.entries(data.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
    )
  }
  // Single message
  if (data.message) return { _general: data.message }
  return {}
}

/**
 * Render a field error <div> if error exists
 */
export function FieldError({ errors, field }) {
  if (!errors?.[field]) return null
  return <div className="invalid-feedback d-block">{errors[field]}</div>
}
