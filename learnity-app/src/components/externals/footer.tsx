/**
 * Footer Component
 * Reusable footer with flexible link sections
 * Clean, modern design
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  sections?: FooterSection[];
  showBrand?: boolean;
  copyright?: string;
  status?: {
    text: string;
    online?: boolean;
  };
  className?: string;
}

const defaultSections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Sign In', href: '/auth/login' },
      { label: 'Register', href: '/auth/register' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: 'For Students',
    links: [
      { label: 'Find a Tutor', href: '/teachers' },
      { label: 'How It Works', href: '/#features' },
      { label: 'Pricing', href: '/teachers' },
    ],
  },
  {
    title: 'For Teachers',
    links: [
      { label: 'Become a Tutor', href: '/auth/register/teacher' },
      { label: 'Teacher Benefits', href: '/about' },
      { label: 'Resources', href: '/about' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Teachers', href: '/teachers' },
      { label: 'Contact', href: '/about' },
    ],
  },
];

export function Footer({
  sections = defaultSections,
  showBrand = true,
  copyright = '© 2025 Learnity. All rights reserved.',
  status,
  className,
}: FooterProps) {
  return (
    <footer className={cn('bg-gray-50 border-t border-gray-200', className)}>
      <div className="container mx-auto px-4 py-12">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            {showBrand && (
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-slate-600 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">Learnity</span>
              </div>
            )}

            {/* Copyright */}
            <div className="text-sm text-gray-600 text-center md:text-left">
              {copyright}
            </div>

            {/* Status */}
            {status && (
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  status.online !== false ? 'bg-green-500' : 'bg-gray-400'
                )}></div>
                <span className="text-sm text-gray-600">{status.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

