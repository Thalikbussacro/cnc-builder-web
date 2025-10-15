import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isNumericType = type === "number" || type === "tel";

    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm text-foreground transition-all duration-200 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
          isNumericType && "font-mono tabular-nums",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
