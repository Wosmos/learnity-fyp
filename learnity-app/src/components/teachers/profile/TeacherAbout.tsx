"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { TeacherData } from "./types";

interface TeacherAboutProps {
  teacher: TeacherData;
}

export function TeacherAbout({ teacher }: TeacherAboutProps) {
  return (
    <div className="space-y-6">
      {/* Video Introduction */}
      {teacher.videoIntroUrl && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Play className="h-6 w-6 mr-2 text-blue-600" />
              Video Introduction
            </h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={teacher.videoIntroUrl}
                title={`${teacher.name} Introduction`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About {teacher.firstName}
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {teacher.bio}
          </p>
        </CardContent>
      </Card>

      {/* Teaching Approach */}
      {teacher.teachingApproach && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Teaching Approach
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {teacher.teachingApproach}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
