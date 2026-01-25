"use client";

import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { TeacherData } from "./types";

interface TeacherProfileHeaderProps {
  teacher: TeacherData;
}

export function TeacherProfileHeader({ teacher }: TeacherProfileHeaderProps) {
  const router = useRouter();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center text-slate-500 hover:text-slate-900 transition-all gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold text-sm">Back</span>
          </button>
          <div className="flex items-center gap-4">
            {teacher.socialLinks &&
              Object.values(teacher.socialLinks).some((link) => link) && (
                <div className="hidden md:flex items-center gap-2 border-r border-slate-100 pr-4 mr-2">
                  {teacher.socialLinks.linkedin && (
                    <a
                      href={teacher.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {teacher.socialLinks.twitter && (
                    <a
                      href={teacher.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {teacher.socialLinks.website && (
                    <a
                      href={teacher.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            <Badge
              variant="outline"
              className="border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-black italic tracking-tighter uppercase text-[10px]"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Active Now
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}
