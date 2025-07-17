import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon, TrendingUp, Calendar, CheckCircle, Search, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: string;
  joinDate?: string;
  [key: string]: any;
}

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const ROWS_PER_PAGE = 5;
const FIXED_ROLES = [
  "Super Admin",
  "Admin",
  "Wellness Coach",
  "Support Staff"
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("users");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      setUsers([]);
    }
    const onStorage = () => {
      const updated = localStorage.getItem("users");
      setUsers(updated ? JSON.parse(updated) : []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });


  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const totalUsers = users.length;
  const activeUsers = Math.max(1, Math.floor(totalUsers * 0.8));
  const thisWeekCount = users.filter(u => {
    if (!u.joinDate) return false;
    const d = new Date(u.joinDate);
    const startOfWeek = getStartOfWeek(new Date());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d >= startOfWeek && d <= endOfWeek;
  }).length;
  const completionRate = totalUsers > 0 ? "100%" : "0%";

  useEffect(() => { setPage(0); }, [searchTerm, roleFilter, users.length, rowsPerPage]);

  const handleDelete = (id: number) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem("users", JSON.stringify(updated));
  };

  const handleView = (user: User) => {
    setViewUser(user);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">Users</h1>
          <p className="text-gray-600 mt-2 text-[#012765]">List of all users added via the Settings page</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Total Users</p>
                <p className="text-3xl font-bold text-[#012765]">{totalUsers}</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Active Users</p>
                <p className="text-3xl font-bold text-[#012765]">{activeUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">This Week</p>
                <p className="text-3xl font-bold text-[#012765]">{thisWeekCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Completion Rate</p>
                <p className="text-3xl font-bold text-[#012765]">{completionRate}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
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
                placeholder="Search by first name, last name, or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {FIXED_ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent>
          {paginatedUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No users found. Add users from the Settings page.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-2 font-medium text-gray-600">#</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">First Name</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Last Name</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Email</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Role</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, idx) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>
                      <td className="py-4 px-2">{user.firstName}</td>
                      <td className="py-4 px-2">{user.lastName}</td>
                      <td className="py-4 px-2">{user.email}</td>
                      <td className="py-4 px-2">{user.role}</td>
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
                </tbody>
              </table>
            </div>
          )}
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
              <Select value={String(rowsPerPage)} onValueChange={val => {
                setRowsPerPage(Number(val));
                setPage(0);
              }}>
                <SelectTrigger className="w-16 h-8 border-gray-200 rounded-md shadow-sm text-gray-700 text-sm focus:ring-2 ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-16 rounded-md shadow-lg border-gray-200">
                  <SelectItem value="5" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">5</SelectItem>
                  <SelectItem value="10" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">10</SelectItem>
                  <SelectItem value="25" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">25</SelectItem>
                  <SelectItem value="100" className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                      {viewUser.firstName?.[0]}{viewUser.lastName?.[0]}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{viewUser.firstName} {viewUser.lastName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium text-gray-600">Email</div>
                    <div className="bg-gray-50 rounded px-2 py-1">{viewUser.email}</div>
                    <div className="font-medium text-gray-600">Role</div>
                    <div className="bg-gray-50 rounded px-2 py-1">{viewUser.role}</div>
                    <div className="font-medium text-gray-600">Join Date</div>
                    <div className="bg-gray-50 rounded px-2 py-1">{viewUser.joinDate ? new Date(viewUser.joinDate).toLocaleDateString() : "-"}</div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
} 