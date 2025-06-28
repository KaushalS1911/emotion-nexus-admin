import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const mockInquiries = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    subject: "Assessment Results Clarification",
    message: "I would like to understand my recent assessment results better. Could someone explain what the wellness score means and how I can improve it?",
    date: "2024-06-23",
    status: "pending",
    priority: "medium",
    assignedTo: null
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    subject: "Technical Issue with Login",
    message: "I'm having trouble logging into my account. The password reset link doesn't seem to be working properly.",
    date: "2024-06-22",
    status: "in-progress",
    priority: "high",
    assignedTo: "Support Team A"
  },
  {
    id: 3,
    name: "Emma Wilson",
    email: "emma.w@email.com",
    subject: "Resource Recommendations",
    message: "Could you recommend some specific resources for dealing with exam anxiety? I found the assessment helpful but need more guidance.",
    date: "2024-06-21",
    status: "resolved",
    priority: "low",
    assignedTo: "Wellness Coach B"
  },
  {
    id: 4,
    name: "David Kumar",
    email: "d.kumar@email.com",
    subject: "Platform Feature Request",
    message: "It would be great to have a mobile app version of the assessment. Are there any plans for this?",
    date: "2024-06-20",
    status: "pending",
    priority: "low",
    assignedTo: null
  }
];

const supportTeam = [
  "Support Team A",
  "Support Team B", 
  "Wellness Coach A",
  "Wellness Coach B",
  "Technical Support"
];

export const InquiriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const filteredInquiries = mockInquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusCounts = {
    pending: mockInquiries.filter(i => i.status === "pending").length,
    inProgress: mockInquiries.filter(i => i.status === "in-progress").length,
    resolved: mockInquiries.filter(i => i.status === "resolved").length,
    total: mockInquiries.length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">
            Inquiries Management
          </h1>
          <p className="text-gray-600 mt-2 text-[#012765]">Manage user inquiries and support requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Total Inquiries</p>
                <p className="text-3xl font-bold text-[#012765]">{statusCounts.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Pending</p>
                <p className="text-3xl font-bold text-[#012765]">{statusCounts.pending}</p>
              </div>
                <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">In Progress</p>
                <p className="text-3xl font-bold text-[#012765]">{statusCounts.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#012765]">Resolved</p>
                <p className="text-3xl font-bold text-[#012765]">{statusCounts.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                placeholder="Search inquiries by name, email, or subject..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Inquiries ({filteredInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-medium text-gray-600">User</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Subject</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Date</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Priority</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Assigned To</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-500">{inquiry.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{inquiry.subject}</p>
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {new Date(inquiry.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(inquiry.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(inquiry.status)}
                          <span>{inquiry.status.replace('-', ' ')}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getPriorityColor(inquiry.priority)}>
                        {inquiry.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-gray-600">
                      {inquiry.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-4 px-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Name</label>
                                  <p className="text-gray-900">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Email</label>
                                  <p className="text-gray-900">{selectedInquiry.email}</p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Subject</label>
                                <p className="text-gray-900">{selectedInquiry.subject}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Message</label>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedInquiry.message}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Status</label>
                                  <Select defaultValue={selectedInquiry.status}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Priority</label>
                                  <Select defaultValue={selectedInquiry.priority}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Assign To</label>
                                  <Select defaultValue={selectedInquiry.assignedTo || ""}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {supportTeam.map(team => (
                                        <SelectItem key={team} value={team}>{team}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">Response</label>
                                <Textarea 
                                  placeholder="Type your response here..."
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Save Changes</Button>
                                <Button>Send Response</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
