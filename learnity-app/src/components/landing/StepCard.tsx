/**
 * Step Card Component
 * Displays a step in the "How It Works" section
 */

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
};

export function StepCard({ number, title, description, color }: StepCardProps) {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className={`flex items-center justify-center w-12 h-12 ${colorClasses[color]} rounded-xl font-bold text-xl mb-6`}>
          {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
