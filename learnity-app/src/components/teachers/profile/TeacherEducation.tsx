"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, TrendingUp, Target, Sparkles } from "lucide-react";
import { TeacherData } from "./types";

interface TeacherEducationProps {
  teacher: TeacherData;
}

export function TeacherEducation({ teacher }: TeacherEducationProps) {
  return (
    <div className="space-y-6">
      {/* Subjects & Specialties */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Subjects & Specialties
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Subjects Taught
              </h3>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((subject, index) => (
                  <Badge
                    key={index}
                    className="px-4 py-2 bg-slate-100 text-blue-700 hover:bg-slate-200"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
            {teacher.specialties.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teacher.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education & Certifications */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Education & Certifications
          </h2>
          <div className="space-y-4">
            {teacher.education.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Education</h3>
                <div className="space-y-2">
                  {teacher.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{edu}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {teacher.certifications.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">
                  Certifications
                </h3>
                <div className="space-y-2">
                  {teacher.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {teacher.achievements.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacher.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Choose Me */}
      {teacher.whyChooseMe && teacher.whyChooseMe.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Why Choose Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teacher.whyChooseMe.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
