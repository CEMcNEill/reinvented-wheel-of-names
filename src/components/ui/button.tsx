import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 1. Define the variants using CVA
// This allows us to define "recipes" for our styles based on props.
const buttonVariants = cva(
    // Base styles applied to ALL buttons
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            // "variant" prop controls the visual style (colors, borders)
            variant: {
                default: "bg-slate-900 text-white hover:bg-slate-900/90",
                destructive: "bg-red-500 text-white hover:bg-red-500/90",
                outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
                ghost: "hover:bg-slate-100 hover:text-slate-900",
                link: "text-slate-900 underline-offset-4 hover:underline",
            },
            // "size" prop controls padding and height
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        // Default values if props are not provided
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

// 2. Define the Props interface
// We extend standard HTML button props so we get onClick, type, disabled, etc. for free.
// We also extend VariantProps to get type safety for our 'variant' and 'size' props.
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

// 3. Create the Component
// forwardRef is crucial! It allows parent components to access the underlying DOM button
// (needed for focus management, animations, etc.)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
