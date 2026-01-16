import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// Skeleton Component
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 lg:row-span-2">
            <Card className="h-full">
              <CardContent className="p-6 space-y-6">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-7 lg:row-span-2">
            <Card className="h-full">
              <CardContent className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="lg:col-span-4">
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ProfileSkeleton;
