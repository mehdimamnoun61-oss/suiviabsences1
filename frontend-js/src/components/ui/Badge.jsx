/**
 * Badge — colored status/label pill
 * variant: "blue" | "green" | "red" | "orange" | "purple" | "yellow" | "gray"
 * size: "sm" | "md"
 */
export function Badge({ children, variant = "blue", size = "md", dot = false }) {
  return (
    <span className={`ui-badge ui-badge-${variant} ui-badge-${size}`}>
      {dot && <span className="ui-badge-dot" />}
      {children}
    </span>
  )
}

export default Badge
