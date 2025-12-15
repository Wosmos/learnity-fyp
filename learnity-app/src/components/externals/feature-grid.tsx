'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define theme colors for the step cards to ensure Icon and Number colors match
type ThemeColor = 'blue' | 'purple' | 'emerald' | 'orange' | 'rose' | 'gray';

export interface FeatureItem {
  icon?: LucideIcon;
  iconElement?: React.ReactNode;
  title: string;
  description?: string;
  content?: React.ReactNode;
  /** Use 'theme' for the Steps variant to automatically coordinate border/icon/bg colors */
  theme?: ThemeColor;
  /** Manual overrides */
  color?: string;
  bgColor?: string;
  className?: string;
}

export interface FeatureGridProps {
  items: FeatureItem[];
  columns?: 1 | 2 | 3 | 4;
  /** 'steps' is the new variant based on your design */
  variant?: 'default' | 'minimal' | 'elevated' | 'outlined' | 'steps';
  centered?: boolean;
  showIcons?: boolean;
  className?: string;
  itemClassName?: string;
}

const gridColsClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

// Maps themes to specific styles for the 'steps' variant
const themeStyles: Record<ThemeColor, { iconBg: string; iconText: string; iconBorder: string; numberHover: string }> = {
  blue: { iconBg: 'bg-slate-500/10', iconText: 'text-blue-500', iconBorder: 'border-blue-500/20', numberHover: 'group-hover:text-blue-500/10' },
  purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-500', iconBorder: 'border-purple-500/20', numberHover: 'group-hover:text-purple-500/10' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-500', iconBorder: 'border-emerald-500/20', numberHover: 'group-hover:text-emerald-500/10' },
  orange: { iconBg: 'bg-orange-500/10', iconText: 'text-orange-500', iconBorder: 'border-orange-500/20', numberHover: 'group-hover:text-orange-500/10' },
  rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-500', iconBorder: 'border-rose-500/20', numberHover: 'group-hover:text-rose-500/10' },
  gray: { iconBg: 'bg-gray-500/10', iconText: 'text-gray-500', iconBorder: 'border-gray-500/20', numberHover: 'group-hover:text-gray-500/10' },
};

const cardVariantClasses = {
  default: 'bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
  minimal: 'bg-transparent border-0 shadow-none hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300',
  elevated: 'bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  outlined: 'bg-transparent border-2 shadow-none hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
  // Specific Step Design
  steps: 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group',
};

export function FeatureGrid({
  items,
  columns = 3,
  variant = 'default',
  centered = true, // Defaults to true for standard cards, logic below handles Steps
  showIcons = true,
  className,
  itemClassName,
}: FeatureGridProps) {

  // For the steps variant, text is typically left-aligned by design
  const isStepVariant = variant === 'steps';
  const effectiveCentered = isStepVariant ? false : centered;

  return (
    <div className={cn(
      'grid gap-8',
      gridColsClasses[columns],
      className
    )}>
      {items.map((item, index) => {
        const Icon = item.icon;

        // --- Color Logic ---
        // If theme is provided, derive styles from themeStyles. 
        // Otherwise fallback to passed colors or defaults.
        const theme = item.theme || 'blue';
        const styles = themeStyles[theme];

        const iconBgColor = item.bgColor || (isStepVariant ? styles.iconBg : 'bg-slate-100');
        const iconColor = item.color || (isStepVariant ? styles.iconText : 'text-blue-600');
        const iconBorder = isStepVariant ? styles.iconBorder : '';
        const numberHoverClass = isStepVariant ? styles.numberHover : '';

        return (
          <Card
            key={index}
            className={cn(
              cardVariantClasses[variant],
              effectiveCentered && 'text-center',
              item.className,
              itemClassName
            )}
          >
            {/* --- Special Background Number for Steps Variant --- */}
            {isStepVariant && (
              <div className={cn(
                "absolute -right-4 -top-6 text-[10rem] leading-none font-bold text-gray-900/5 dark:text-white/5 transition-colors select-none z-0 pointer-events-none",
                numberHoverClass
              )}>
                {index + 1}
              </div>
            )}

            <CardContent className={cn("p-1 relative z-10", !isStepVariant && "p-6")}>

              {/* --- Icon Section --- */}
              {showIcons && (Icon || item.iconElement) && (
                <div className={cn(
                  'flex items-center justify-center mb-6',
                  // Styles specific to Steps variant
                  isStepVariant
                    ? `w-14 h-14 rounded-2xl border ${iconBorder} ${iconBgColor}`
                    : `w-14 h-14 rounded-xl ${iconBgColor}`,
                  effectiveCentered ? 'mx-auto' : ''
                )}>
                  {Icon ? (
                    <Icon className={cn(
                      isStepVariant ? 'h-6 w-6' : 'h-7 w-7',
                      iconColor
                    )} />
                  ) : (
                    item.iconElement
                  )}
                </div>
              )}

              {/* --- Title --- */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {item.title}
              </h3>

              {/* --- Description --- */}
              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* --- Custom Content --- */}
              {item.content}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}