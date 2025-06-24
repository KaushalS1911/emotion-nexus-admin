
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, Download, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    category: "K12",
    joinDate: "2024-01-15",
    lastActive: "2024-06-20",
    wellnessScore: 85,
    assessments: 12,
    status: "active"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    category: "Employee",
    joinDate: "2024-02-20",
    lastActive: "2024-06-22",
    wellnessScore: 78,
    assessments: 8,
    status: "active"
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    category: "Aspirant",
    joinDate: "2024-03-10",
    lastActive: "2024-06-18",
    wellnessScore: 82,
    assessments: 15,
    status: "inactive"
  },
  {
    id: 4,
    name: "David Kumar",
    email: "d.kumar@email.com",
    category: "Primary",
    joinDate: "2024-01-05",
    lastActive: "2024-06-23",
    wellnessScore: 91,
    assessments: 20,
    status: "active"
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    email: "lisa.r@email.com",
    category: "K12",
    joinDate: "2024-04-12",
    lastActive: "2024-06-21",
    wellnessScore: 76,
    assessments: 6,
    status: "active"
  }
];

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || user.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      K12: "bg-purple-100 text-purple-800",
      Primary: "bg-blue-100 text-blue-800",
      Aspirant: "bg-green-100 text-green-800",
      Employee: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and monitor user accounts</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-blue-600">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-medium text-gray-600">User</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Category</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Join Date</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Wellness Score</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Assessments</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getCategoryColor(user.category)}>
                        {user.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                            style={{ width: `${user.wellnessScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{user.wellnessScore}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-gray-600">{user.assessments}</td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
