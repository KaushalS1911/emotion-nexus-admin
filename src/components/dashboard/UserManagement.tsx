import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Download, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  assessmentName: string;
  joinDate: string;
  status: string;
  phone?: string;
  address?: string;
  notes?: string;
  wellnessScore?: number;
  lastActive?: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    age: 16,
    assessmentName: "Stress Management Assessment",
    joinDate: "2024-01-15",
    status: "active",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    notes: "Excellent progress in stress management modules",
    wellnessScore: 85,
    lastActive: "2024-06-20"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    age: 28,
    assessmentName: "Work-Life Balance Assessment",
    joinDate: "2024-02-20",
    status: "active",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, City, State 12345",
    notes: "Focusing on work-life balance",
    wellnessScore: 78,
    lastActive: "2024-06-22"
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    age: 22,
    assessmentName: "Anxiety Management Assessment",
    joinDate: "2024-03-10",
    status: "inactive",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Rd, City, State 12345",
    notes: "Preparing for competitive exams",
    wellnessScore: 82,
    lastActive: "2024-06-18"
  },
  {
    id: 4,
    name: "David Kumar",
    email: "d.kumar@email.com",
    age: 12,
    assessmentName: "Mindfulness Assessment",
    joinDate: "2024-01-05",
    status: "active",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, City, State 12345",
    notes: "Very engaged with mindfulness exercises",
    wellnessScore: 91,
    lastActive: "2024-06-23"
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    email: "lisa.r@email.com",
    age: 17,
    assessmentName: "Social Confidence Assessment",
    joinDate: "2024-04-12",
    status: "active",
    phone: "+1 (555) 567-8901",
    address: "654 Maple Dr, City, State 12345",
    notes: "Recently started anxiety management program",
    wellnessScore: 76,
    lastActive: "2024-06-21"
  }
];

// Persistence keys
const STORAGE_KEYS = {
  USERS: 'userManagement_users',
  SEARCH: 'userManagement_search',
  STATUS_FILTER: 'userManagement_statusFilter'
};

export const UserManagement = () => {
  // Load persisted state on component mount
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : mockUsers;
  });
  
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SEARCH) || "";
  });
  
  const [statusFilter, setStatusFilter] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.STATUS_FILTER) || "all";
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEARCH, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATUS_FILTER, statusFilter);
  }, [statusFilter]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.assessmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm(user);
  };

  const handleSave = () => {
    if (editingUser && editForm) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...editForm } : user
      ));
      setEditingUser(null);
      setEditForm({});
      toast.success("User updated successfully");
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleDelete = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User deleted successfully");
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Age", "Assessment Name", "Join Date", "Status"],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.age.toString(),
        user.assessmentName,
        user.joinDate,
        user.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">
            User Management
          </h1>
          <p className="text-[#012765] mt-2">Manage and monitor user accounts</p>
        </div>
        <Button 
          className="mt-4 md:mt-0 bg-[#012765] text-white hover:bg-[#012765]/90"
          onClick={handleExport}
        >
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
                placeholder="Search users by name, email, or assessment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
          <CardTitle className="text-[#FF7119]">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Name</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Email</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Age</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Assessment Name</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Join Date</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Status</th>
                <th className="text-left py-4 px-2 font-medium text-[#012765]">Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#012765] text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#012765]">{user.name}</p>
                          {/*<p className="text-sm text-gray-500">{user.email}</p>*/}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-[#012765]">{user.email}</td>
                    <td className="py-4 px-2 text-[#012765] font-medium">{user.age}</td>
                    <td className="py-4 px-2 text-sm text-[#012765] max-w-xs truncate" title={user.assessmentName}>
                      {user.assessmentName}
                    </td>
                    <td className="py-4 px-2 text-[#012765]">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4 text-[#012765]"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingUser(user)}>
                            <Eye className="h-4 w-4 mr-2 text-[#012765]"/>
                            View
                          </DropdownMenuItem>
                          {/*<DropdownMenuItem onClick={() => handleEdit(user)}>*/}
                          {/*  <Edit className="h-4 w-4 mr-2 text-[#012765]"/>*/}
                          {/*  Edit*/}
                          {/*</DropdownMenuItem>*/}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Delete
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

      {/* View User Modal */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#FF7119]">User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#012765] text-white text-lg">
                    {viewingUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-[#012765]">{viewingUser.name}</h3>
                  <p className="text-gray-500">{viewingUser.email}</p>
                  <Badge className={getStatusColor(viewingUser.status)}>
                    {viewingUser.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Age</p>
                    <p className="text-[#012765]">{viewingUser.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Assessment Name</p>
                    <p className="text-[#012765]">{viewingUser.assessmentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Join Date</p>
                    <p className="text-[#012765]">{new Date(viewingUser.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Last Active</p>
                    <p className="text-[#012765]">{viewingUser.lastActive ? new Date(viewingUser.lastActive).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Phone</p>
                    <p className="text-[#012765]">{viewingUser.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Wellness Score</p>
                    <p className="text-[#012765]">{viewingUser.wellnessScore || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#012765]">Address</p>
                    <p className="text-[#012765] text-sm">{viewingUser.address || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              {viewingUser.notes && (
                <div>
                  <p className="text-sm font-medium text-[#012765]">Notes</p>
                  <p className="text-[#012765] text-sm bg-gray-50 p-3 rounded-md">{viewingUser.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#FF7119]">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#012765]">Name</label>
              <Input
                value={editForm.name || ""}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Email</label>
              <Input
                value={editForm.email || ""}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Age</label>
              <Input
                type="number"
                value={editForm.age || ""}
                onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Assessment Name</label>
              <Input
                value={editForm.assessmentName || ""}
                onChange={(e) => setEditForm({...editForm, assessmentName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Status</label>
              <Select 
                value={editForm.status || ""} 
                onValueChange={(value) => setEditForm({...editForm, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Phone</label>
              <Input
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Address</label>
              <Textarea
                value={editForm.address || ""}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#012765]">Notes</label>
              <Textarea
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                className="bg-[#012765] text-white hover:bg-[#012765]/90"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
