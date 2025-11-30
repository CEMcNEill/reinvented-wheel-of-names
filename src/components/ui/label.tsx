import * as React from "react"
import { cn } from "@/lib/utils"

// A simple Label component to enforce consistent styling for form labels.
// We extend LabelHTMLAttributes to support 'htmlFor' and other standard props.

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
))
Label.displayName = "Label"

export { Label }
