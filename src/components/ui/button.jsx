import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#58CC02] text-white shadow-[0_4px_0_0_#58A700] hover:bg-[#61D802] active:shadow-[0_2px_0_0_#58A700] active:translate-y-[2px]",
        outline:
          "border-2 border-[#E5E5E5] bg-white text-[#3C3C3C] hover:border-[#58CC02] hover:bg-[#F7F7F7]",
        ghost: "hover:bg-[#F7F7F7] text-[#3C3C3C]",
        link: "text-[#1CB0F6] underline-offset-4 hover:underline",
        destructive:
          "bg-[#FF4B4B] text-white shadow-[0_4px_0_0_#EA2B2B] hover:bg-[#FF5555] active:shadow-[0_2px_0_0_#EA2B2B] active:translate-y-[2px]",
      },
      size: {
        default: "h-14 px-8 py-4",
        sm: "h-10 rounded-xl px-4",
        lg: "h-16 rounded-2xl px-10",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
