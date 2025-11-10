/**
 * Feature Card Component
 * Reusable card for displaying features
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  bgColor: string;
}

export function FeatureCard({ icon: Icon, title, description, benefits, color, bgColor }: FeatureCardProps) {
  return (
    <Card className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      <CardHeader className="p-0 mb-6">
        <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center mb-6`}>
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{title}</CardTitle>
        <CardDescription className="text-gray-600 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
