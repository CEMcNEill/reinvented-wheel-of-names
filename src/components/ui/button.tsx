import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import styles from "./button.module.css"

// 1. Define the variants using CVA
// This allows us to define "recipes" for our styles based on props.
const buttonVariants = cva(
    // Base styles applied to ALL buttons
    styles.btn,
    {
        variants: {
            // "variant" prop controls the visual style (colors, borders)
            variant: {
                default: styles['btn--default'],
                destructive: styles['btn--destructive'],
                outline: styles['btn--outline'],
                secondary: styles['btn--secondary'],
                ghost: styles['btn--ghost'],
                link: styles['btn--link'],
            },
            // "size" prop controls padding and height
            size: {
                default: styles['btn--size-default'],
                sm: styles['btn--size-sm'],
                lg: styles['btn--size-lg'],
                icon: styles['btn--size-icon'],
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
