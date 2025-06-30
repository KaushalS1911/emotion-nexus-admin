import { useState, useEffect } from "react";
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

// TypeScript interfaces for dynamic data
interface InquiryBase {
  id: number;
  inquiryType: "Contact" | "Request a Callback";
  email: string;
  phone?: string;
  message: string;
  date: string;
  status: "pending" | "in-progress" | "resolved";
  assignedTo: string | null;
  responses: { content: string; timestamp: string }[];
}

interface ContactInquiry extends InquiryBase {
  inquiryType: "Contact";
  firstName: string;
  lastName: string;
  inquiryCategory: string;
}

interface CallbackInquiry extends InquiryBase {
  inquiryType: "Request a Callback";
  fullName: string;
  age: number;
}

type Inquiry = ContactInquiry | CallbackInquiry;

const getInitialInquiries = (): Inquiry[] => {
  const stored = localStorage.getItem("inquiries");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback to mock if corrupted
    }
  }
  return [
    {
      id: 1,
      inquiryType: "Contact",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@email.com",
      phone: "(123) 456-7890",
      inquiryCategory: "Individual Therapy",
      message:
        "I would like to understand my recent assessment results better. Could someone explain what the wellness score means and how I can improve it?",
      date: "2024-06-23",
      status: "pending",
      assignedTo: null,
      responses: [],
    },
    {
      id: 2,
      inquiryType: "Request a Callback",
      fullName: "Michael Chen",
      email: "m.chen@email.com",
      phone: "(234) 567-8901",
      age: 28,
      message: "Please call me back regarding my account access.",
      date: "2024-06-22",
      status: "in-progress",
      assignedTo: "Support Team A",
      responses: [
        { content: "We will call you back today.", timestamp: "2024-06-22T10:30:00" },
      ],
    },
    {
      id: 3,
      inquiryType: "Contact",
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma.w@email.com",
      phone: "(345) 678-9012",
      inquiryCategory: "Technical Support",
      message:
        "Could you recommend some specific resources for dealing with exam anxiety? I found the assessment helpful but need more guidance.",
      date: "2024-06-21",
      status: "resolved",
      assignedTo: "Wellness Coach B",
      responses: [],
    },
    {
      id: 4,
      inquiryType: "Request a Callback",
      fullName: "David Kumar",
      email: "d.kumar@email.com",
      phone: "(456) 789-0123",
      age: 19,
      message: "I would like to discuss a feature request over the phone.",
      date: "2024-06-20",
      status: "pending",
      assignedTo: null,
      responses: [],
    },
  ];
};

const supportTeam = [
  "Support Team A",
  "Support Team B",
  "Wellness Coach A",
  "Wellness Coach B",
  "Technical Support",
];

export const InquiriesManagement = () => {
  // State for inquiries, filters, and selected inquiry
  const [inquiries, setInquiries] = useState<Inquiry[]>(getInitialInquiries());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseInput, setResponseInput] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  // Editable fields for dialog
  const [editStatus, setEditStatus] = useState<string>("");
  const [editAssignedTo, setEditAssignedTo] = useState<string>("");

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  // When opening dialog, set editable fields
  useEffect(() => {
    if (selectedInquiry) {
      setEditStatus(selectedInquiry.status);
      setEditAssignedTo(selectedInquiry.assignedTo || "");
    }
  }, [selectedInquiry]);

  // Filter logic
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch = (
      (inquiry.inquiryType === "Contact"
        ? `${(inquiry as ContactInquiry).firstName || ""} ${(inquiry as ContactInquiry).lastName || ""}`
        : (inquiry as CallbackInquiry).fullName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.inquiryType === "Contact"
        ? (inquiry as ContactInquiry).inquiryCategory
        : ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (inquiry.message || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    const matchesType = typeFilter === "all" || inquiry.inquiryType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Status icon and color helpers
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

  // Status counts for stats
  const statusCounts = {
    pending: inquiries.filter((i) => i.status === "pending").length,
    inProgress: inquiries.filter((i) => i.status === "in-progress").length,
    resolved: inquiries.filter((i) => i.status === "resolved").length,
    total: inquiries.length,
  };

  // Response handler (mock, for future API integration)
  const handleSendResponse = () => {
    if (!selectedInquiry || !responseInput.trim()) return;
    const updated = inquiries.map((inq) =>
      inq.id === selectedInquiry.id
        ? {
            ...inq,
            responses: [
              ...(inq.responses || []),
              { content: responseInput, timestamp: new Date().toISOString() },
            ],
          }
        : inq
    );
    setInquiries(updated);
    setSelectedInquiry({
      ...selectedInquiry,
      responses: [
        ...(selectedInquiry.responses || []),
        { content: responseInput, timestamp: new Date().toISOString() },
      ],
    });
    setResponseInput("");
  };

  // Save handler for status/assignment
  const handleSaveEdit = () => {
    if (!selectedInquiry) return;
    const updated = inquiries.map((inq) =>
      inq.id === selectedInquiry.id
        ? { ...inq, status: editStatus as Inquiry["status"], assignedTo: editAssignedTo || null }
        : inq
    );
    setInquiries(updated);
    setDialogOpen(false);
    setSelectedInquiry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">Inquiries</h1>
          <p className="text-gray-600 mt-2 text-[#012765]">
            Manage user inquiries and support requests
          </p>
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
                placeholder="Search inquiries by name, email and Inquiry Category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Inquiry Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Contact">Contact</SelectItem>
                <SelectItem value="Request a Callback">Request a Callback</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="border-0 shadow-lg">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Name</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Email</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Phone</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Age</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Inquiry Category</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Assigned To</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Inquiry Type</th>
                  <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-2">
                      {inquiry.inquiryType === "Contact"
                        ? `${(inquiry as ContactInquiry).firstName} ${(inquiry as ContactInquiry).lastName}`
                        : (inquiry as CallbackInquiry).fullName}
                    </td>
                    <td className="py-4 px-2">{inquiry.email}</td>
                    <td className="py-4 px-2">{inquiry.phone || "-"}</td>
                    <td className="py-4 px-2">{inquiry.inquiryType === "Request a Callback" ? (inquiry as CallbackInquiry).age : "-"}</td>
                    <td className="py-4 px-2">{inquiry.inquiryType === "Contact" ? (inquiry as ContactInquiry).inquiryCategory : "-"}</td>
                    <td className="py-4 px-2 text-gray-600">
                      {inquiry.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(inquiry.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(inquiry.status)}
                          <span>{inquiry.status.replace("-", " ")}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={inquiry.inquiryType === "Contact" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}>
                        {inquiry.inquiryType}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Dialog open={dialogOpen && selectedInquiry?.id === inquiry.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) setSelectedInquiry(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setDialogOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                          </DialogHeader>
                          {selectedInquiry && selectedInquiry.id === inquiry.id && (
                            <div className="space-y-6">
                              {/* Details Table */}
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border border-gray-200 rounded-lg bg-white">
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Inquiry Type</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.inquiryType}</td>
                                    </tr>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Date</td>
                                      <td className="px-4 py-2 bg-gray-50">{new Date(selectedInquiry.date).toLocaleDateString()}</td>
                                    </tr>
                                    {selectedInquiry.inquiryType === "Contact" ? (
                                      <>
                                        <tr className="border-b">
                                          <td className="font-medium text-gray-600 px-4 py-2">First Name</td>
                                          <td className="px-4 py-2 bg-gray-50">{(selectedInquiry as ContactInquiry).firstName}</td>
                                        </tr>
                                        <tr className="border-b">
                                          <td className="font-medium text-gray-600 px-4 py-2">Last Name</td>
                                          <td className="px-4 py-2 bg-gray-50">{(selectedInquiry as ContactInquiry).lastName}</td>
                                        </tr>
                                        <tr className="border-b">
                                          <td className="font-medium text-gray-600 px-4 py-2">Inquiry Category</td>
                                          <td className="px-4 py-2 bg-gray-50">{(selectedInquiry as ContactInquiry).inquiryCategory}</td>
                                        </tr>
                                      </>
                                    ) : (
                                      <>
                                        <tr className="border-b">
                                          <td className="font-medium text-gray-600 px-4 py-2">Full Name</td>
                                          <td className="px-4 py-2 bg-gray-50">{(selectedInquiry as CallbackInquiry).fullName}</td>
                                        </tr>
                                        <tr className="border-b">
                                          <td className="font-medium text-gray-600 px-4 py-2">Age</td>
                                          <td className="px-4 py-2 bg-gray-50">{(selectedInquiry as CallbackInquiry).age}</td>
                                        </tr>
                                      </>
                                    )}
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Email</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.email}</td>
                                    </tr>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Phone</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.phone || "-"}</td>
                                    </tr>
                                    <tr>
                                      <td className="font-medium text-gray-600 px-4 py-2 align-top">Message</td>
                                      <td className="px-4 py-2 whitespace-pre-line bg-gray-50 rounded">{selectedInquiry.message}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              {/* Response History */}
                              {selectedInquiry.responses && selectedInquiry.responses.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4 mt-2">
                                  <div className="font-semibold text-gray-700 mb-2">Responses</div>
                                  <ul className="space-y-2">
                                    {selectedInquiry.responses.map((resp, idx) => (
                                      <li key={idx} className="border-l-4 border-orange-500 pl-3">
                                        <div className="text-sm text-gray-800">{resp.content}</div>
                                        <div className="text-xs text-gray-500 mt-1">{new Date(resp.timestamp).toLocaleString()}</div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {/* Response Input */}
                              <div>
                                <label className="text-sm font-medium text-gray-600">Send a Response</label>
                                <Textarea
                                  placeholder="Type your response here..."
                                  className="mt-1"
                                  value={responseInput}
                                  onChange={e => setResponseInput(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                  <Button onClick={handleSendResponse} disabled={!responseInput.trim()}>
                                    Send Response
                                  </Button>
                                </div>
                              </div>
                              {/* Status & Assignment Controls (editable) */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 items-end">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Status</label>
                                  <Select value={editStatus} onValueChange={setEditStatus}>
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
                                  <label className="text-sm font-medium text-gray-600">Assign To</label>
                                  <Select value={editAssignedTo} onValueChange={setEditAssignedTo}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {supportTeam.map((team) => (
                                        <SelectItem key={team} value={team}>
                                          {team}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex md:justify-end mt-4 md:mt-0">
                                  <Button onClick={handleSaveEdit} variant="default">
                                    Save
                                  </Button>
                                </div>
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
