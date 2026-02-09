import React from 'react';
import { PublicLayout } from '@/components/layout/AppLayout';
import { Shield, Eye, Lock, Globe, Database, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Learnity',
  description:
    'How we collect, use, and protect your personal information at Learnity.',
};

export default function PrivacyPolicy() {
  const lastUpdated = 'February 4, 2026';

  const policySections = [
    {
      title: 'Information We Collect',
      icon: <Database className='w-5 h-5 text-indigo-600' />,
      items: [
        {
          label: 'Personal Information',
          text: 'Name, email address, phone number, and profile picture.',
        },
        {
          label: 'Educational Data',
          text: 'Academic history, subjects of interest, and tutor certifications.',
        },
        {
          label: 'Usage Information',
          text: 'IP address, browser type, device information, and interaction logs.',
        },
        {
          label: 'Payment Data',
          text: 'Billing information processed securely via our third-party partners.',
        },
      ],
    },
    {
      title: 'How We Use Your Data',
      icon: <UserCheck className='w-5 h-5 text-indigo-600' />,
      items: [
        {
          label: 'Service Delivery',
          text: 'To facilitate lessons and matching between students and tutors.',
        },
        {
          label: 'Communication',
          text: 'Sending session reminders, platform updates, and support messages.',
        },
        {
          label: 'Security',
          text: 'Monitoring for fraudulent activity and maintaining platform integrity.',
        },
        {
          label: 'Personalization',
          text: 'Tailoring tutor recommendations based on your learning goals.',
        },
      ],
    },
    {
      title: 'Data Sharing & Disclosure',
      icon: <Globe className='w-5 h-5 text-indigo-600' />,
      items: [
        {
          label: 'Tutor-Student Matching',
          text: 'Basic profile info shared between parties to facilitate lessons.',
        },
        {
          label: 'Third-party Providers',
          text: 'Payment processors and analytics services (e.g., Stripe, Google Analytics).',
        },
        {
          label: 'Legal Obligations',
          text: 'When required by law to comply with legal processes or protect rights.',
        },
      ],
    },
    {
      title: 'Your Privacy Controls',
      icon: <Lock className='w-5 h-5 text-indigo-600' />,
      items: [
        {
          label: 'Access & Edit',
          text: 'You can update your profile information at any time via settings.',
        },
        {
          label: 'Data Deletion',
          text: 'Request account deletion by contacting our support team.',
        },
        {
          label: 'Cookies',
          text: 'Manage browser cookie preferences through your personal settings.',
        },
      ],
    },
  ];

  return (
    <PublicLayout>
      <div className='bg-slate-50 min-h-screen pb-20'>
        {/* Header Section */}
        <section className='py-20 bg-white border-b border-slate-100'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6'>
                <Shield className='w-4 h-4' />
                Privacy & Trust
              </div>
              <h1 className='text-4xl md:text-5xl font-black text-slate-900 mb-6 italic tracking-tight'>
                Privacy Policy
              </h1>
              <p className='text-slate-600 text-lg leading-relaxed'>
                Your privacy is our priority. This policy explains how we handle
                your data with transparency and security at the core of our
                operations.
              </p>
              <p className='mt-4 text-slate-400 text-sm'>
                Last Updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className='py-16'>
          <div className='container mx-auto px-4'>
            <div className='max-w-5xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {policySections.map((section, idx) => (
                  <div
                    key={idx}
                    className='bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-100 transition-all group'
                  >
                    <div className='flex items-center gap-4 mb-6'>
                      <div className='p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors'>
                        {section.icon}
                      </div>
                      <h2 className='text-xl font-bold text-slate-900'>
                        {section.title}
                      </h2>
                    </div>

                    <div className='space-y-4'>
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className='space-y-1'>
                          <h3 className='text-xs font-black uppercase tracking-widest text-indigo-600 italic'>
                            {item.label}
                          </h3>
                          <p className='text-slate-600 text-sm leading-relaxed'>
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Card */}
              <div className='mt-12 p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32' />
                <div className='relative z-10'>
                  <div className='flex flex-col md:flex-row items-center gap-8'>
                    <div className='p-5 bg-white/10 rounded-3xl backdrop-blur-xl'>
                      <Eye className='w-8 h-8 text-white' />
                    </div>
                    <div className='flex-1 text-center md:text-left'>
                      <h3 className='text-2xl font-bold mb-2'>
                        Platform Transparency
                      </h3>
                      <p className='text-slate-400 leading-relaxed max-w-xl'>
                        We believe in complete transparency. If you have any
                        concerns about how your data is being handled, our Data
                        Protection Officer is available to assist you.
                      </p>
                    </div>
                    <div className='flex flex-col gap-2 min-w-[200px]'>
                      <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 italic'>
                        Contact DPO
                      </span>
                      <a
                        href='mailto:learnity.lms@gmail.com'
                        className='text-lg font-bold hover:text-indigo-400 transition-colors'
                      >
                        learnity.lms@gmail.com
                      </a>
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
