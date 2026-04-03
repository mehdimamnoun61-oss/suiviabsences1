/**
 * Button — primary | secondary | danger | ghost | icon
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconOnly = false,
  tooltip,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${iconOnly ? "ui-btn-icon-only" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
      aria-label={tooltip || (typeof children === "string" ? children : undefined)}
      {...props}
    >
      {loading ? (
        <span className="ui-btn-spinner" aria-hidden="true" />
      ) : (
        <>
          {icon && <span className="ui-btn-icon" aria-hidden="true">{icon}</span>}
          {!iconOnly && children && <span>{children}</span>}
        </>
      )}
    </button>
  )
}

export default Button
