import * as React from "react"
import { cn } from "@/lib/utils"

import styles from "./card.module.css"

// The Card component is a "Compound Component".
// Instead of one giant component taking 50 props (title, footer, content, image...),
// we break it down into smaller, composable pieces.

// 1. The Main Container
const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(styles.card, className)}
        {...props}
    />
))
Card.displayName = "Card"

// 2. The Header (container for Title and Description)
const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(styles['card-header'], className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

// 3. The Title
const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(styles['card-title'], className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

// 4. The Description (subtext)
const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(styles['card-description'], className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

// 5. The Content (body)
const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn(styles['card-content'], className)} {...props} />
))
CardContent.displayName = "CardContent"

// 6. The Footer (actions)
const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(styles['card-footer'], className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
