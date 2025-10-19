import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-learnity-50 via-white to-learnity-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-8 h-8 text-learnity-600" />
            <h1 className="text-5xl font-bold text-gray-900">Learnity</h1>
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Pakistan's first gamified learning platform. Connect with tutors,
            join study groups, and learn through engaging, bite-sized lessons.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/role-selection">
              <Button variant="gamified" size="xl" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Students</h3>
              <p className="text-gray-600">
                Learn with gamified lessons, earn XP, maintain streaks, and
                connect with expert tutors.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Teachers</h3>
              <p className="text-gray-600">
                Share your knowledge, set your pricing, and earn by teaching
                passionate students.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                All teachers are verified by our admin team to ensure the
                highest quality education.
              </p>
            </div>
          </div>

          {/* Gamification Preview */}
          <div className="mt-16 p-8 bg-gradient-to-r from-learnity-500 to-learnity-600 rounded-2xl text-white">
            <h2 className="text-3xl font-bold mb-4">
              🎮 Gamified Learning Experience
            </h2>
            <div className="grid sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">🔥</div>
                <div className="text-sm">Daily Streaks</div>
              </div>
              <div>
                <div className="text-2xl font-bold">⭐</div>
                <div className="text-sm">XP Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold">🏆</div>
                <div className="text-sm">Achievements</div>
              </div>
              <div>
                <div className="text-2xl font-bold">👥</div>
                <div className="text-sm">Study Groups</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
