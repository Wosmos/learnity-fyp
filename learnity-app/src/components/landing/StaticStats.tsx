/**
 * Static Stats Component - Server Component
 * Displays platform statistics without client-side JavaScript
 */

interface StaticStatsProps {
  stats: {
    activeLearners: string;
    verifiedTutors: string;
    lessonsCompleted: string;
  };
}

export function StaticStats({ stats }: StaticStatsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {stats.activeLearners}
        </div>
        <div className="text-gray-600 text-sm">Active Learners</div>
      </div>
      
      <div className="hidden sm:block w-px h-12 bg-gray-300" />
      
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {stats.verifiedTutors}
        </div>
        <div className="text-gray-600 text-sm">Verified Tutors</div>
      </div>
      
      <div className="hidden sm:block w-px h-12 bg-gray-300" />
      
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">
          {stats.lessonsCompleted}
        </div>
        <div className="text-gray-600 text-sm">Lessons Completed</div>
      </div>
    </div>
  );
}