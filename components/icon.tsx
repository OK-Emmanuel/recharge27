import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

// Single entry point for interface icons so stroke weight and sizing stay consistent.
export function Icon({
  icon,
  size = 20,
  strokeWidth = 1.5,
  className,
  label,
}: {
  icon: IconSvgElement
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  )
}
