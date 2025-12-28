import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from '../ui/progress';

// Mock data for the graphs
const engagementData = [
  { day: 'Mon', interactions: 45, students: 12 },
  { day: 'Tue', interactions: 72, students: 18 },
  { day: 'Wed', interactions: 38, students: 15 },
  { day: 'Thu', interactions: 85, students: 22 },
  { day: 'Fri', interactions: 62, students: 20 },
  { day: 'Sat', interactions: 95, students: 28 },
  { day: 'Sun', interactions: 55, students: 14 },
];

const healthData = [
  { name: 'On Track', value: 88, color: '#6366f1' },
  { name: 'At Risk', value: 12, color: '#f43f5e' },
];

export default function AnalyticsView() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

        {/* 1. ENGAGEMENT FLOW - PREMIUM AREA CHART */}
        <Card className="border-none shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur overflow-hidden">
          <div className="h-1.5 w-full bg-indigo-500" />
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Engagement Flow</CardTitle>
              <CardDescription className="text-xs">Weekly student interactions</CardDescription>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-black">
              <TrendingUp className="h-3 w-3" /> +12%
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="interactions"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorInteractions)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. STUDENT HEALTH - DATA VISUALIZATION CARD */}
        <Card className="border-none shadow-xl shadow-indigo-100/50 bg-slate-900 text-white overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-indigo-500" />
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Student Health</CardTitle>
            <CardDescription className="text-slate-400">Real-time risk assessment</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Progress Detail */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /> On Track</span>
                  <span className="text-emerald-400">88%</span>
                </div>
                <Progress value={88} className="h-2 bg-white/10" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500" /> Requires Attention</span>
                  <span className="text-rose-400">12%</span>
                </div>
                <Progress value={12} className="h-2 bg-white/10" />
              </div>
            </div>

            {/* Quick Insight Mini-Chart */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold">Risk Insight</p>
                <p className="text-[10px] text-slate-400">Completion rate dropped by 4% in Module 2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Custom Glassmorphic Tooltip for the graph
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-600">
          {payload[0].value} Interactions
        </p>
      </div>
    );
  }
  return null;
};