"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Play,
  Loader2,
  Lock,
  MessageSquare,
  Video,
  GraduationCap,
} from "lucide-react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/courses";
import { ReviewForm } from "@/components/courses/ReviewForm";
import { ReviewsList } from "@/components/courses/ReviewsList";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: "VIDEO" | "QUIZ";
  youtubeUrl?: string;
  youtubeId?: string;
  duration: number;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface Teacher {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ReviewsData {
  reviews: any[];
  rating: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  price?: number;
  totalDuration: number;
  lessonCount: number;
  enrollmentCount: number;
  averageRating: number;
  reviewCount: number;
  estimatedDuration: string;
  whatsappGroupLink?: string;
  contactEmail?: string;
  teacher: Teacher;
  sections: Section[];
  tags: string[];
}

interface CourseDetailClientProps {
  course: CourseData;
  initialReviews: ReviewsData | null;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "reviews", label: "Reviews" },
];

export default function CourseDetailClient({
  course,
  initialReviews,
}: CourseDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useClientAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState<ReviewsData | null>(initialReviews);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any | null>(null);

  const checkStatus = useCallback(async () => {
    if (!user) return;
    try {
      const [enrollRes, eligRes] = await Promise.all([
        authenticatedFetch(`/api/courses/${course.id}/enroll`),
        authenticatedFetch(`/api/courses/${course.id}/reviews/eligibility`),
      ]);

      if (enrollRes.ok) {
        const d = await enrollRes.json();
        setIsEnrolled(d.data?.isEnrolled || false);
      }

      if (eligRes.ok) {
        const d = await eligRes.json();
        setCanReview(d.data?.canReview || false);
        if (d.data?.existingReview) setExistingReview(d.data.existingReview);
      }
    } catch (err) {
      console.error(err);
    }
  }, [course.id, user, authenticatedFetch]);

  useEffect(() => {
    if (!authLoading && user) checkStatus();
  }, [authLoading, user, checkStatus]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    try {
      setIsEnrolling(true);
      const res = await authenticatedFetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Enrollment failed");
      setIsEnrolled(true);
      toast({ title: "Success", description: "Enrolled successfully!" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const totalLessons =
    course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Mobile Sidebar (Price/Tabs) shows here in real layout if needed, but for Onyx we use Tabs logic */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 -mx-4 px-4 py-2">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap pt-2",
                  activeTab === tab.id
                    ? "text-slate-900 border-indigo-500"
                    : "text-slate-400 border-transparent hover:text-slate-600",
                )}
              >
                {tab.label}{" "}
                {tab.id === "curriculum" && (
                  <span className="ml-1 opacity-50">({totalLessons})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] py-4">
          {activeTab === "overview" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                  Course Overview
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Core Concept Mastery",
                  "Hands-on implementation",
                  "Real-world scenario testing",
                  "Architectural understanding",
                ].map((p, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 items-start"
                  >
                    <CheckCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-slate-700">
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Accordion
                type="multiple"
                defaultValue={["section-0"]}
                className="space-y-4"
              >
                {course.sections.map((section, idx) => (
                  <AccordionItem
                    key={section.id}
                    value={`section-${idx}`}
                    className="border-none bg-white rounded-[2rem] px-2 shadow-sm border border-slate-50 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline rounded-2xl group">
                      <div className="flex flex-col items-start text-left gap-1">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                          {idx + 1}. SECTION
                        </span>
                        <span className="text-lg font-black text-slate-900 tracking-tight">
                          {section.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-2">
                        {section.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                {lesson.type === "VIDEO" ? (
                                  <Play className="h-4 w-4 fill-current" />
                                ) : (
                                  <BookOpen className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">
                                  {lesson.title}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {lesson.type}
                                </span>
                              </div>
                            </div>
                            {!isEnrolled && lIdx > 0 && (
                              <Lock className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Card className="border-none bg-slate-900 rounded-[2.5rem] overflow-hidden text-white shadow-2xl">
                <CardContent className="p-10 flex flex-col md:flex-row gap-12 items-center">
                  <div className="text-center md:text-left">
                    <div className="text-7xl font-black italic tracking-tighter text-indigo-400">
                      {reviews?.rating?.averageRating.toFixed(1) ||
                        course.averageRating.toFixed(1)}
                    </div>
                    <StarRating
                      value={
                        reviews?.rating?.averageRating || course.averageRating
                      }
                      size="sm"
                      readonly
                    />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
                      Aggregate Rating
                    </p>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count =
                        reviews?.rating?.ratingDistribution?.[s] || 0;
                      const total = reviews?.rating?.totalReviews || 1;
                      return (
                        <div key={s} className="flex items-center gap-4">
                          <span className="text-[10px] font-black w-4">
                            {s}
                          </span>
                          <Progress
                            value={(count / total) * 100}
                            className="h-1.5 bg-slate-800"
                            indicatorClassName="bg-indigo-500"
                          />
                          <span className="text-[10px] font-black text-slate-500 w-10 text-right">
                            {Math.round((count / total) * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {user && isEnrolled && !existingReview && canReview && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="rounded-2xl h-14 w-full bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest shadow-sm"
                >
                  Write Review
                </Button>
              )}

              {showReviewForm && (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
                  <ReviewForm
                    courseId={course.id}
                    courseName={course.title}
                    existingReview={existingReview}
                    onSuccess={() => {
                      setShowReviewForm(false);
                      checkStatus();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <div className="space-y-4">
                {isLoadingReviews ? (
                  <Loader2 className="animate-spin text-indigo-500 mx-auto" />
                ) : (
                  <ReviewsList
                    reviews={
                      reviews?.reviews.map((r) => ({
                        ...r,
                        student: {
                          ...r.student,
                          firstName: r.student.name.split(" ")[0],
                          lastName: r.student.name.split(" ")[1] || "",
                          profilePicture: r.student.avatarUrl,
                        },
                      })) || []
                    }
                    emptyMessage="No intelligence reports available."
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Direct Access
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">
                    {course.isFree ? "FREE" : `$${course.price}`}
                  </span>
                  {course.isFree && (
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">
                      100% OFF
                    </span>
                  )}
                </div>
              </div>

              {isEnrolled ? (
                <Button
                  onClick={() =>
                    router.push(`/dashboard/student/courses/${course.id}/learn`)
                  }
                  className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all"
                >
                  <Play className="h-4 w-4 mr-3 fill-current" /> Continue
                  Learning
                </Button>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                >
                  {isEnrolling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Initiate Enrollment"
                  )}
                </Button>
              )}

              <div className="space-y-4 pt-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Specifications
                </h4>
                <div className="space-y-3">
                  <SpecItem
                    icon={Video}
                    label={`${totalLessons} units of content`}
                  />
                  <SpecItem
                    icon={Clock}
                    label={`${course.estimatedDuration} total runtime`}
                  />
                  <SpecItem icon={GraduationCap} label="Certified Outcome" />
                  <SpecItem icon={Lock} label="Permanent Access" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
      <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon className="h-4 w-4" />
      </div>
      {label}
    </div>
  );
}
