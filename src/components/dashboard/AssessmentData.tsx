
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, TrendingUp, FileText, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const mockAssessments = [
  {
    id: 1,
    userId: "sarah.j@email.com",
    userName: "Sarah Johnson",
    category: "K12",
    date: "2024-06-23",
    score: 85,
    duration: "12 min",
    recommendations: ["Stress management techniques", "Mindfulness exercises"],
    issues: ["Mild anxiety", "Sleep concerns"]
  },
  {
    id: 2,
    userId: "m.chen@email.com",
    userName: "Michael Chen",
    category: "Employee",
    date: "2024-06-22",
    score: 78,
    duration: "15 min",
    recommendations: ["Work-life balance", "Communication skills"],
    issues: ["Work stress", "Time management"]
  },
  {
    id: 3,
    userId: "emma.w@email.com",
    userName: "Emma Wilson",
    category: "Aspirant",
    date: "2024-06-21",
    score: 82,
    duration: "18 min",
    recommendations: ["Goal setting", "Confidence building"],
    issues: ["Exam anxiety", "Self-doubt"]
  },
  {
    id: 4,
    userId: "d.kumar@email.com",
    userName: "David Kumar",
    category: "Primary",
    date: "2024-06-20",
    score: 91,
    duration: "10 min",
    recommendations: ["Continue positive habits", "Social activities"],
    issues: ["Minor social concerns"]
  }
];

const scoreDistributionData = [
  { range: "0-20", count: 12 },
  { range: "21-40", count: 45 },
  { range: "41-60", count: 156 },
  { range: "61-80", count: 289 },
  { range: "81-100", count: 178 }
];

const weeklyAssessmentData = [
  { week: 'Week 1', assessments: 245 },
  { week: 'Week 2', assessments: 289 },
  { week: 'Week 3', assessments: 312 },
  { week: 'Week 4', assessments: 298 },
  { week: 'Week 5', assessments: 334 },
  { week: 'Week 6', assessments: 367 }
];

export const AssessmentData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredAssessments = mockAssessments.filter(assessment => {
    const matchesSearch = assessment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || assessment.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      K12: "bg-purple-100 text-purple-800",
      Primary: "bg-blue-100 text-blue-800",
      Aspirant: "bg-green-100 text-green-800",
      Employee: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Assessment Data
          </h1>
          <p className="text-gray-600 mt-2">Monitor assessment results and insights</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Assessments</p>
                <p className="text-2xl font-bold text-blue-700">12,847</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg. Score</p>
                <p className="text-2xl font-bold text-green-700">78.5</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">This Week</p>
                <p className="text-2xl font-bold text-purple-700">367</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-700">94.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Assessment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyAssessmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="assessments" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="K12">K12 Students</SelectItem>
                <SelectItem value="Primary">Primary Students</SelectItem>
                <SelectItem value="Aspirant">Aspirants</SelectItem>
                <SelectItem value="Employee">Employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Assessments ({filteredAssessments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-medium text-gray-600">User</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Category</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Date</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Score</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Duration</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Issues</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{assessment.userName}</p>
                        <p className="text-sm text-gray-500">{assessment.userId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getCategoryColor(assessment.category)}>
                        {assessment.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {new Date(assessment.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getScoreColor(assessment.score)}>
                        {assessment.score}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-gray-600">{assessment.duration}</td>
                    <td className="py-4 px-2">
                      <div className="space-y-1">
                        {assessment.issues.slice(0, 2).map((issue, index) => (
                          <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
