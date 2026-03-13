import { cn } from "@/lib/utils"

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClass = sizeClasses[size]
  const initials = name ? getInitials(name) : "?"

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={cn(
          "rounded-full object-cover bg-background-secondary",
          sizeClass,
          className
        )}
        onError={(e) => {
          e.currentTarget.style.display = "none"
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary-light text-primary flex items-center justify-center font-medium flex-shrink-0",
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  )
}
