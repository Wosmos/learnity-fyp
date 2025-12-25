"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Star,
  Quote,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { TeacherData, Testimonial } from "./types";

interface TeacherReviewsProps {
  teacher: TeacherData;
  testimonials: Testimonial[];
  getRatingDistribution: () => {
    stars: number;
    percentage: number;
    count: number;
  }[];
}

export function TeacherReviews({
  teacher,
  testimonials,
  getRatingDistribution,
}: TeacherReviewsProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* FAQ Section */}
      {teacher.faqs && teacher.faqs.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="h-6 w-6 mr-2 text-orange-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {teacher.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedFAQ(expandedFAQ === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-4 pb-4 text-gray-700 border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
            Rating Breakdown
          </h2>
          <div className="space-y-3">
            {getRatingDistribution().map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-gray-700">
                    {item.stars}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {item.percentage}% ({item.count})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Quote className="h-6 w-6 mr-2 text-purple-600" />
              Student Reviews ({testimonials.length})
            </h2>
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.studentName}
                      </div>
                      {testimonial.subject && (
                        <div className="text-sm text-gray-500">
                          {testimonial.subject}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{testimonial.comment}</p>
                  {testimonial.isVerified && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
