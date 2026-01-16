// components/layout/MobileBottomNav.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import type { SidebarConfig } from './DashboardSidebar';

// --- Helper: Active Route Checker (local to this component) ---
const useActiveRoute = (pathname: string, role: string, navItems: Array<{ href: string }>) => {
  return (href: string) => {
    if (pathname === href) return true;
    const basePath = `/dashboard/${role}`;
    if (href === basePath) return pathname === href;

    if (pathname.startsWith(href)) {
      const remainder = pathname.slice(href.length);
      if (remainder !== '' && !remainder.startsWith('/')) return false;

      const hasBetterMatch = navItems.some(
        (item) => item.href !== href && item.href.length > href.length && pathname.startsWith(item.href)
      );
      return !hasBetterMatch;
    }
    return false;
  };
};

interface MobileBottomNavProps {
  config: SidebarConfig;
  onLogout: () => Promise<void>;
}

export function MobileBottomNav({ config, onLogout }: MobileBottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const isActive = useActiveRoute(pathname, config.role, config.navItems);

  const mainItems = config.navItems.slice(0, 4);
  const moreItems = config.navItems.slice(4);

  return (
    <>
      {/* ONYX FLOATING DOCK */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-[50] flex justify-center pointer-events-none">
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="pointer-events-auto flex items-center bg-slate-950/90 backdrop-blur-3xl rounded-[32px] p-1.5 border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
        >
          {mainItems.map((item, index) => {
            const active = isActive(item.href);
            if (index === 0)
              return (
                <Link key={item.href} href={item.href} className="mx-1">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                      active
                        ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        : "bg-slate-900 text-slate-500"
                    )}
                  >
                    <item.icon className="w-5 h-5 stroke-[2.5px]" />
                  </motion.div>
                </Link>
              );

            return (
              <Link key={item.href} href={item.href} className="relative w-12 h-12 flex items-center justify-center">
                <motion.div whileTap={{ scale: 0.8 }} className={cn("relative z-10", active ? "text-white" : "text-slate-500")}>
                  <item.icon className="w-5 h-5 stroke-[2px]" />
                </motion.div>
                {active && (
                  <motion.div
                    layoutId="onyxPill"
                    className="absolute inset-1 bg-white/10 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}

          <div className="w-[1px] h-6 bg-white/10 mx-1" />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMoreOpen(true)}
            className="w-12 h-12 flex items-center justify-center text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </motion.nav>
      </div>

      {/* ONYX DRAWER OVERLAY */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsMoreOpen(false);
              }}
              className="absolute bottom-0 left-0 right-0 bg-slate-950 rounded-t-[48px] border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[94vh] overflow-hidden"
            >
              <div className="mx-auto mt-4 mb-6 w-14 h-1.5 bg-white/10 rounded-full flex-shrink-0 cursor-grab active:cursor-grabbing" />

              <div className="px-8 pb-16 overflow-y-auto custom-scrollbar">
                <header className="mb-10 pt-2">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2 block">Navigation</span>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                      Explore <span className="text-indigo-500">More</span>
                    </h2>
                  </motion.div>
                </header>

                <div className="space-y-3">
                  {moreItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-center gap-5 p-4 bg-white/[0.03] border border-white/5 rounded-[24px] hover:bg-white/[0.06] active:scale-[0.97] transition-all group"
                      >
                        <div className="w-12 h-12 rounded-[18px] bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400">
                          <item.icon className="w-6 h-6 stroke-[2.4px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black uppercase tracking-tight text-white italic group-hover:text-indigo-400 transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="ml-auto w-5 h-5 text-slate-800 group-hover:text-slate-500 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + moreItems.length * 0.05 }}
                  >
                    <Link
                      href={`/dashboard/${config.role}/settings`}
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-5 p-4 bg-white/[0.015] border border-white/5 rounded-[24px] group"
                    >
                      <div className="w-12 h-12 rounded-[18px] bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                        <Settings className="w-6 h-6 stroke-[1.5px]" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[15px] font-black uppercase tracking-tight text-slate-400 italic">Settings</span>
                      </div>
                      <ChevronRight className="ml-auto w-5 h-5 text-slate-800" />
                    </Link>
                  </motion.div>
                </div>

                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onLogout();
                    }}
                    className="w-full h-16 rounded-[24px] bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black uppercase italic tracking-[0.3em] text-[11px] transition-all"
                  >
                    Terminate Session
                  </Button>

                  <button
                    onClick={() => setIsMoreOpen(false)}
                    className="w-full text-center text-[9px] font-black uppercase tracking-[0.8em] text-slate-700 hover:text-slate-500 transition-colors mt-8 mb-6"
                  >
                    Dismiss Modal
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}