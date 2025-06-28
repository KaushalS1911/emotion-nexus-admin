
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Activity, Target } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const userTrendsData = [
  { month: 'Jan', users: 1200, active: 980 },
  { month: 'Feb', users: 1800, active: 1450 },
  { month: 'Mar', users: 2400, active: 1920 },
  { month: 'Apr', users: 3200, active: 2560 },
  { month: 'May', users: 4100, active: 3280 },
  { month: 'Jun', users: 5200, active: 4160 },
];

const wellnessScoreData = [
  { week: 'Week 1', score: 72 },
  { week: 'Week 2', score: 75 },
  { week: 'Week 3', score: 78 },
  { week: 'Week 4', score: 82 },
  { week: 'Week 5', score: 85 },
  { week: 'Week 6', score: 88 },
];

const userCategoryData = [
  { name: 'K12 Students', value: 35, color: '#8b5cf6' },
  { name: 'Primary Students', value: 25, color: '#06b6d4' },
  { name: 'Aspirants', value: 20, color: '#10b981' },
  { name: 'Employees', value: 20, color: '#f59e0b' },
];

const topIssuesData = [
  { issue: 'Stress Management', count: 340 },
  { issue: 'Anxiety', count: 280 },
  { issue: 'Focus Issues', count: 245 },
  { issue: 'Sleep Problems', count: 190 },
  { issue: 'Social Confidence', count: 165 },
];

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">Monitor your emotional wellness platform performance</p>
        </div>
        <div className="text-sm text-gray-500 mt-4 md:mt-0">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Users</p>
                <p className="text-3xl font-bold text-purple-700">5,234</p>
                <p className="text-xs text-purple-500 mt-1">+12% from last month</p>
              </div>
              <Users className="h-12 w-12 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Users</p>
                <p className="text-3xl font-bold text-blue-700">4,156</p>
                <p className="text-xs text-blue-500 mt-1">+8% this week</p>
              </div>
              <Activity className="h-12 w-12 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg. Wellness Score</p>
                <p className="text-3xl font-bold text-green-700">82.5</p>
                <p className="text-xs text-green-500 mt-1">+5.2 points</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Assessments</p>
                <p className="text-3xl font-bold text-orange-700">12,847</p>
                <p className="text-xs text-orange-500 mt-1">+23% completion rate</p>
              </div>
              <Target className="h-12 w-12 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#06b6d4" 
                  fill="url(#colorActive)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Wellness Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wellnessScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>User Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top 5 Wellness Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topIssuesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="issue" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
