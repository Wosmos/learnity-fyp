import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold uppercase tracking-widest transition-all duration-300 disabled:pointer-events-none disabled:opacity-30 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none active:scale-[0.96] select-none",
  {
    variants: {
      variant: {
        // High-contrast Obsidian (Primary)
        onyx: "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
        
        // Glassmorphism (Secondary)
        morphic: "bg-white/[0.03] text-white border border-white/10 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20",
        
        // Deep Blue Glow (Action)
        glow: "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] border border-blue-400/20",
        
        outline: "border border-white/10 bg-transparent text-slate-400 hover:text-white hover:border-white/40",
        
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
        
        destructive: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",
        
        link: "text-blue-400 underline-offset-4 hover:underline lowercase italic tracking-tight",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-xl px-4 text-[10px]",
        lg: "h-14 rounded-[1.5rem] px-8 text-base",
        icon: "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "onyx",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }