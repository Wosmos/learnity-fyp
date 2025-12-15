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
  blue: 'bg-slate-100/50 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] backdrop-blur-sm',
  purple: 'bg-purple-100/50 text-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)] backdrop-blur-sm',
  green: 'bg-green-100/50 text-green-600 shadow-[0_0_15px_rgba(22,163,74,0.3)] backdrop-blur-sm',
};

export function StepCard({ number, title, description, color }: StepCardProps) {
  return (
    <div className="relative h-full">
      <div className="glass-card rounded-2xl p-8 h-full">
        <div className={`flex items-center justify-center w-12 h-12 ${colorClasses[color]} rounded-xl font-bold text-xl mb-6`}>
          {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
