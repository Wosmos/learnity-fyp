import React from 'react';
import { PublicLayout } from '@/components/layout/AppLayout';
import { SectionHeader } from '@/components/externals';
import { ShieldCheck, FileText, Lock, Eye, Scale, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Terms of Service | Learnity',
    description: 'Legal terms and conditions for using the Learnity platform.',
};

export default function TermsOfService() {
    const lastUpdated = 'February 4, 2026';

    const sections = [
        {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
            content: `By accessing or using Learnity, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all visitors, users, and others who access the service.`
        },
        {
            id: 'eligibility',
            title: '2. Eligibility',
            icon: <Scale className="w-5 h-5 text-indigo-600" />,
            content: `You must be at least 13 years old to use Learnity. If you are under 18, you must have the consent of a parent or legal guardian to use the platform. Use by anyone under 13 is strictly prohibited.`
        },
        {
            id: 'accounts',
            title: '3. User Accounts',
            icon: <Lock className="w-5 h-5 text-indigo-600" />,
            content: `When you create an account with us, you must provide information that is accurate and complete. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. Tutors must provide accurate educational credentials and undergo a verification process.`
        },
        {
            id: 'marketplace',
            title: '4. Marketplace Role',
            icon: <FileText className="w-5 h-5 text-indigo-600" />,
            content: `Learnity acts as a marketplace to connect students with tutors. While we verify tutor credentials, we do not guarantee the quality of lessons or the academic outcomes. All tutors are independent contractors and not employees of Learnity.`
        },
        {
            id: 'payments',
            title: '5. Payments & Refunds',
            icon: <AlertCircle className="w-5 h-5 text-indigo-600" />,
            content: `Payments for tutoring sessions are processed through our platform. Tutors set their own rates. Learnity may charge a service fee for facilitating the transaction. Refunds are handled according to our Cancellation Policy, which typically requires 24-hour notice for full refunds.`
        },
        {
            id: 'conduct',
            title: '6. User Conduct',
            icon: <Eye className="w-5 h-5 text-indigo-600" />,
            content: `Users agree to maintain a professional environment during lessons. Recording of sessions without explicit consent from both parties is prohibited. Users must not use the platform for academic dishonesty, including completing assignments or exams for students.`
        }
    ];

    return (
        <PublicLayout>
            <div className="bg-slate-50 min-h-screen pb-20">
                {/* Header Section */}
                <section className="py-20 bg-white border-b border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                                <FileText className="w-4 h-4" />
                                Legal Documents
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 italic tracking-tight">
                                Terms of Service
                            </h1>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                Please read these terms carefully before using the Learnity platform.
                                They govern your relationship with our services.
                            </p>
                            <p className="mt-4 text-slate-400 text-sm">
                                Last Updated: {lastUpdated}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 md:p-12 space-y-12">
                                    {sections.map((section) => (
                                        <div key={section.id} id={section.id} className="group">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                                    {section.icon}
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-900">
                                                    {section.title}
                                                </h2>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed pl-16">
                                                {section.content}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="pt-8 border-t border-slate-50">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                Need Clarification?
                                            </h3>
                                            <p className="text-slate-600 text-sm italic">
                                                If you have any questions about these Terms, please contact our legal team at
                                                <span className="text-indigo-600 font-medium ml-1">legal@learnity.com</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
