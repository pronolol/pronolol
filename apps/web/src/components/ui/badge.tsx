import React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-background-secondary text-text-secondary",
        primary: "bg-primary-light text-primary",
        success: "bg-success-light text-success-dark",
        warning: "bg-warning-light text-warning-dark",
        error: "bg-error-light text-error-dark",
        live: "bg-error text-white",
        completed: "bg-background-secondary text-text-secondary",
        upcoming: "bg-primary-light text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
