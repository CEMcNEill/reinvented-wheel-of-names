import * as React from "react"
import { cn } from "@/lib/utils"

// Input usually doesn't need complex variants like Button, 
// so we can skip CVA here unless we want different "sizes" of inputs later.
// We just use a standard interface extending HTML input props.

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Base styles:
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    // File input styles:
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    // Placeholder styles:
                    "placeholder:text-muted-foreground",
                    // Focus styles (very important for accessibility):
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    // Disabled state:
                    "disabled:cursor-not-allowed disabled:opacity-50",
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
