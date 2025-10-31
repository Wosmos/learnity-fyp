/**
 * Role Selection Component
 * Allows users to choose their role during registration
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { GraduationCap, BookOpen, Shield, Users } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  available: boolean;
}

const roleOptions: RoleOption[] = [
  {
    role: UserRole.STUDENT,
    title: 'Student',
    description: 'Join study groups, book tutoring sessions, and track your learning progress',
    features: [
      'Access to study groups and peer learning',
      'Book one-on-one tutoring sessions',
      'Track learning progress and achievements',
      'Personalized learning recommendations',
      'Mobile-optimized learning experience'
    ],
    icon: GraduationCap,
    color: 'border-blue-200 hover:border-blue-300 bg-blue-50/50',
    available: true
  },
  {
    role: UserRole.TEACHER,
    title: 'Teacher',
    description: 'Share your expertise, teach students, and earn income through tutoring',
    features: [
      'Create and manage tutoring sessions',
      'Upload educational content and resources',
      'Track student progress and performance',
      'Flexible scheduling and pricing',
      'Professional teacher verification process'
    ],
    icon: BookOpen,
    color: 'border-green-200 hover:border-green-300 bg-green-50/50',
    available: true
  },
  {
    role: UserRole.ADMIN,
    title: 'Administrator',
    description: 'Platform management and oversight (Invitation only)',
    features: [
      'Full platform management access',
      'User and content moderation',
      'Teacher application review and approval',
      'Analytics and reporting dashboard',
      'System configuration and settings'
    ],
    icon: Shield,
    color: 'border-purple-200 hover:border-purple-300 bg-purple-50/50',
    available: false
  }
];

export interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void;
  className?: string;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({
  onRoleSelect,
  className = ''
}) => {
  const { selectedRole, setSelectedRole, setRegistrationStep } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    if (!roleOptions.find(option => option.role === role)?.available) {
      return;
    }
    
    setSelectedRole(role);
    setRegistrationStep('form');
    onRoleSelect(role);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Join Learnity</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose your role to get started with personalized features and experiences
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedRole === option.role;
          const isDisabled = !option.available;

          return (
            <Card
              key={option.role}
              className={`
                relative cursor-pointer transition-all duration-200 transform hover:scale-105
                ${option.color}
                ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md hover:shadow-lg'}
                ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              onClick={() => !isDisabled && handleRoleSelect(option.role)}
            >
              {isDisabled && (
                <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                  Invitation Only
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-3 rounded-lg
                    ${option.role === UserRole.STUDENT ? 'bg-blue-100 text-blue-600' : ''}
                    ${option.role === UserRole.TEACHER ? 'bg-green-100 text-green-600' : ''}
                    ${option.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' : ''}
                  `}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {option.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600 mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`
                    w-full font-medium
                    ${option.role === UserRole.STUDENT ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    ${option.role === UserRole.TEACHER ? 'bg-green-600 hover:bg-green-700' : ''}
                    ${option.role === UserRole.ADMIN ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : ''}
                  `}
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) handleRoleSelect(option.role);
                  }}
                >
                  {isDisabled ? 'Contact Admin' : `Continue as ${option.title}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;