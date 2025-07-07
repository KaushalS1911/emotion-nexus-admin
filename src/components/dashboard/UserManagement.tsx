import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// User interface
type UserStatus = "active" | "inactive";
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  assessmentName: string;
  joinDate: string;
  status: UserStatus;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    age: 16,
    assessmentName: "Wellness Basics",
    joinDate: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    age: 28,
    assessmentName: "Employee Wellness",
    joinDate: "2024-02-20",
    status: "active",
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    age: 19,
    assessmentName: "Aspirant Mindset",
    joinDate: "2024-03-10",
    status: "inactive",
  },
  {
    id: 4,
    name: "David Kumar",
    email: "d.kumar@email.com",
    age: 14,
    assessmentName: "Primary Growth",
    joinDate: "2024-01-05",
    status: "active",
  },
  {
    id: 5,
    name: "Lisa Rodriguez",
    email: "lisa.r@email.com",
    age: 17,
    assessmentName: "K12 Progress",
    joinDate: "2024-04-12",
    status: "active",
  },
];

const getInitialUsers = (): User[] => {
  const stored = localStorage.getItem("users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback to mock if corrupted
    }
  }
  return [...mockUsers];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(getInitialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  // Reset page if filters change
  useEffect(() => { setPage(0); }, [searchTerm, statusFilter]);

  // Filter users by name, email, assessment name, and status
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.assessmentName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const getStatusColor = (status: UserStatus) =>
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";

  // Export users as CSV
  const handleExport = () => {
    const header = ["Name", "Email", "Age", "Assessment Name", "Join Date", "Status"];
    const rows = users.map((u) => [u.name, u.email, u.age, u.assessmentName, u.joinDate, u.status]);
    const csv = [header, ...rows].map((row) => row.map(String).map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete user
  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // View user details
  const handleView = (user: User) => {
    setViewUser(user);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">Users</h1>
          <p className="text-gray-600 mt-2 text-[#012765]">Manage and monitor user accounts</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-[#012765] text-white" onClick={handleExport}>
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
                placeholder="Search users by name, email, or assessment name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-0 shadow-lg">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-medium text-gray-600">#</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Name</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Email</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Age</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Assessment Name</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Join Date</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, idx) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#012765] flex items-center justify-center text-white font-semibold text-lg">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-2 text-gray-600">{user.age}</td>
                    <td className="py-4 px-2 text-gray-600">{user.assessmentName}</td>
                    <td className="py-4 px-2 text-gray-600">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    </td>
                    <td className="py-4 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(user)}>
                            <Eye className="h-4 w-4 mr-2 text-blue-600" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="w-full flex justify-end mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 ">
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                aria-label="Previous page"
              >
                &#60;
              </button>
              <span className="font-medium">{filteredUsers.length === 0 ? 0 : page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredUsers.length)}</span>
              <span className="text-gray-400">of</span>
              <span className="font-semibold text-[#012765] text-base ml-2">{filteredUsers.length}</span>
              <button
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
              >
                &#62;
              </button>
              <span className="text-sm text-gray-500 ml-4">Rows per page:</span>
              <Select value={rowsPerPage === filteredUsers.length ? 'All' : String(rowsPerPage)} onValueChange={val => {
                if (val === 'All') {
                  setRowsPerPage(filteredUsers.length || 1);
                  setPage(0);
                } else {
                  setRowsPerPage(Number(val));
                  setPage(0);
                }
              }}>
                <SelectTrigger className="w-16 h-8 border-gray-200 rounded-md shadow-sm text-gray-700 text-sm focus:ring-2 ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-16 rounded-md shadow-lg border-gray-200">
                  <SelectItem value="5" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">5</SelectItem>
                  <SelectItem value="10" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">10</SelectItem>
                  <SelectItem value="25" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">25</SelectItem>
                  <SelectItem value="All" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#012765] flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials(viewUser.name)}
                </div>
                <span className="text-lg font-semibold text-gray-900">{viewUser.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium text-gray-600">Email</div>
                <div className="bg-gray-50 rounded px-2 py-1">{viewUser.email}</div>
                <div className="font-medium text-gray-600">Age</div>
                <div className="bg-gray-50 rounded px-2 py-1">{viewUser.age}</div>
                <div className="font-medium text-gray-600">Assessment Name</div>
                <div className="bg-gray-50 rounded px-2 py-1">{viewUser.assessmentName}</div>
                <div className="font-medium text-gray-600">Join Date</div>
                <div className="bg-gray-50 rounded px-2 py-1">{new Date(viewUser.joinDate).toLocaleDateString()}</div>
                <div className="font-medium text-gray-600">Status</div>
                <div className="bg-gray-50 rounded px-2 py-1">
                  <Badge className={getStatusColor(viewUser.status)}>{viewUser.status}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
