import * as React from "react"
import { cn } from "@/lib/utils"
import styles from "./input.module.css"

// Input usually doesn't need complex variants like Button, 
// so we can skip CVA here unless we want different "sizes" of inputs later.
// We just use a standard interface extending HTML input props.

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(styles.input, className)}
                ref={ref}
                {...props}
            />
        )
    }
)

Input.displayName = "Input"

export { Input }
