import * as React from "react"

import { cn } from "@renderer/lib/utils"

import { Button, type ButtonProps } from "./button"

type IconButtonSize = "sm" | "md" | "lg"

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  size?: IconButtonSize
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  )
)
IconButton.displayName = "IconButton"

export { IconButton }
