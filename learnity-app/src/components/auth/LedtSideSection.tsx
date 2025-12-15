import { BookOpen, GraduationCap, Star, Users, Quote } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface LedtSideSectionProps {
    title?: string;
    subtitle?: string;
    statCount?: string;
    statLabel?: string;
    testimonial?: {
        quote: string;
        author: string;
        role: string;
    };
}

const LedtSideSection = ({
    title = "Unlock your potential with expert-led learning.",
    subtitle = "Join thousands of students and teachers on a journey of discovery. Experience a platform designed for modern education.",
    statCount = "500+",
    statLabel = "Courses",
    testimonial
}: LedtSideSectionProps) => {
    return (
        <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393798-3828fb40905f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

            {/* Content */}
            <div className="relative z-10">
                <Link href="/" className="flex items-center space-x-2 w-fit group">
                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Learnity</span>
                </Link>
            </div>

            <div className="relative z-10 max-w-lg space-y-6">
                <h1 className="text-5xl font-bold leading-tight tracking-tight">
                    {title}
                </h1>
                <p className="text-lg text-slate-300">
                    {subtitle}
                </p>

                {testimonial ? (
                    <div className="pt-4 space-y-4">
                        <div className="flex items-start space-x-3">
                            <Quote className="h-8 w-8 text-blue-400 rotate-180 opacity-50" />
                            <p className="text-lg italic text-slate-200">"{testimonial.quote}"</p>
                        </div>
                        <div className="pl-11">
                            <p className="font-semibold text-white">{testimonial.author}</p>
                            <p className="text-sm text-slate-400">{testimonial.role}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-8 pt-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-medium z-${10 - i}`}>
                                    <Users className="h-4 w-4 text-slate-400" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center text-yellow-500 space-x-1">
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                                <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="text-sm text-slate-400 font-medium">Trusted by 10,000+ users</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 flex items-center justify-between text-sm text-slate-400 border-t border-white/10 pt-8">
                <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{statCount} {statLabel}</span>
                </div>
                <span>&copy; {new Date().getFullYear()} Learnity Inc.</span>
            </div>
        </div>
    )
}

export default LedtSideSection