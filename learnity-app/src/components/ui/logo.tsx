import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Glow = "blue" | "purple" | "green" | "none"

interface LogoProps {
  showText?: boolean
  href?: string
  logoSize?: number
  textSize?: string
  bgClass?: string
  textColor?: string
  glow?: Glow
  className?: string
}

const glowClasses: Record<Glow, string> = {
  blue: "bg-blue-600/20", // Reduced opacity so it stays dark
  purple: "bg-purple-600/20",
  green: "bg-emerald-600/20",
  none: "bg-transparent",
}

const Logo = ({
  showText = true,
  href = "/",
  logoSize = 30, // Slightly smaller default
  textSize = "text-xl",
  // Default bg is dark, hover bg is slightly darker or stays dark
  bgClass = "bg-[#020617] border border-white/10", 
  textColor = "text-white",
  glow = "blue",
  className,
}: LogoProps) => {
  return (
    <Link 
      href={href} 
      className={cn("flex items-center gap-2.5 group w-fit select-none", className)}
    >
      <div className="relative">
        {/* Dark Squircle Glow */}
        {glow !== "none" && (
          <div
            className={cn(
              "absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[35%]",
              glowClasses[glow]
            )}
          />
        )}

        {/* The Squircle Container */}
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden transition-all duration-500",
            "rounded-[35%] group-hover:border-white/20 group-hover:bg-[#020617]", // Explicitly stay dark on hover
            bgClass
          )}
          style={{ 
            width: logoSize + 14, 
            height: logoSize + 14 
          }}
        >
          {/* Micro-Animation on SVG */}
          <div className="relative z-10 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:-translate-y-0.5">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={logoSize}
              height={logoSize}
              className="object-contain"
              priority
            />
          </div>
          
          {/* Subtle Dark Gradient Overlay (Instead of bright shine) */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-100" />
        </div>
      </div>

      {showText && (
        <span className={cn(
          "font-black tracking-tighter transition-all duration-300 group-hover:translate-x-0.5",
          textSize, 
          textColor
        )}>
          Learnity
        </span>
      )}
    </Link>
  )
}

export default Logo;