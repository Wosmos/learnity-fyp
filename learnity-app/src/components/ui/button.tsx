import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: Added "miter" sharp corners option and smooth cubic-bezier timing
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] disabled:pointer-events-none disabled:opacity-20 outline-none select-none active:scale-[0.98] relative overflow-hidden group",
  {
    variants: {
      variant: {
        // PERSONALITY: THE MONOLITH (High-end, Solid, Authoritative)
        // Design: Pure white that "breathes" into a slaty gray with a thick inner shadow
        onyx: [
          "bg-white text-black",
          "hover:bg-slate-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]",
          "after:absolute after:inset-0 after:bg-gradient-to-tr after:from-black/10 after:to-transparent after:opacity-0 hover:after:opacity-100 transition-opacity"
        ],

        // PERSONALITY: THE GHOST TERMINAL (Technical, Subtle, Glass)
        // Design: A hairline border that glows white on hover, with a "scanning" scanline effect
        morphic: [
          "bg-[#050608] text-slate-400 border border-white/[0.05]",
          "hover:text-white hover:border-white/40 hover:bg-[#0a0c10]",
          "before:absolute before:inset-0 before:bg-[url('https://grainy-gradients.vercel.app/noise.svg')] before:opacity-0 hover:before:opacity-[0.03]"
        ],

        // PERSONALITY: THE NOVA (Action, Energy, High-Heat)
        // Design: Monochromatic black button with an Indigo "Underglow" rather than a background color
        nova: [
          "bg-[#050608] text-white border border-indigo-500/30",
          "hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
          "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-indigo-500 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500"
        ],

        // PERSONALITY: THE SHADOW (Minimalist, Silent)
        outline: [
          "border-b-2 border-white/5 bg-transparent text-slate-500",
          "hover:text-white hover:border-white/20 hover:bg-white/[0.02]"
        ],

        // PERSONALITY: THE VOID (Pure Text, High Tracking)
        ghost: [
          "text-slate-500 tracking-[0.4em] font-bold",
          "hover:text-white hover:bg-white/[0.03] before:content-['//'] before:mr-2 before:opacity-0 hover:before:opacity-40 before:transition-opacity"
        ],

        destructive: "bg-red-500/5 text-red-500/50 border border-red-500/10 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-9 px-4 text-[9px] tracking-[0.3em]",
        lg: "h-16 px-10 text-[13px] rounded-2xl",
        icon: "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "onyx",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="opacity-50 italic">Syncing...</span>
        </div>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }