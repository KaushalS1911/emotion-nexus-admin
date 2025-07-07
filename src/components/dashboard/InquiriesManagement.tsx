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

// API endpoints
const API_LIST = "https://interactapiverse.com/mahadevasth/enquiry/list";
const API_SINGLE = (id: string | number) => `https://interactapiverse.com/mahadevasth/enquiry/${id}`;

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
    // {
    //   id: 1,
    //   inquiryType: "Contact",
    //   firstName: "Sarah",
    //   lastName: "Johnson",
    //   email: "sarah.j@email.com",
    //   phone: "(123) 456-7890",
    //   inquiryCategory: "Individual Therapy",
    //   message:
    //     "I would like to understand my recent assessment results better. Could someone explain what the wellness score means and how I can improve it?",
    //   date: "2024-06-23",
    //   status: "pending",
    //   assignedTo: null,
    //   responses: [],
    // },
    // {
    //   id: 2,
    //   inquiryType: "Request a Callback",
    //   fullName: "Michael Chen",
    //   email: "m.chen@email.com",
    //   phone: "(234) 567-8901",
    //   age: 28,
    //   message: "Please call me back regarding my account access.",
    //   date: "2024-06-22",
    //   status: "in-progress",
    //   assignedTo: "Support Team A",
    //   responses: [
    //     { content: "We will call you back today.", timestamp: "2024-06-22T10:30:00" },
    //   ],
    // },
    // {
    //   id: 3,
    //   inquiryType: "Contact",
    //   firstName: "Emma",
    //   lastName: "Wilson",
    //   email: "emma.w@email.com",
    //   phone: "(345) 678-9012",
    //   inquiryCategory: "Technical Support",
    //   message:
    //     "Could you recommend some specific resources for dealing with exam anxiety? I found the assessment helpful but need more guidance.",
    //   date: "2024-06-21",
    //   status: "resolved",
    //   assignedTo: "Wellness Coach B",
    //   responses: [],
    // },
    // {
    //   id: 4,
    //   inquiryType: "Request a Callback",
    //   fullName: "David Kumar",
    //   email: "d.kumar@email.com",
    //   phone: "(456) 789-0123",
    //   age: 19,
    //   message: "I would like to discuss a feature request over the phone.",
    //   date: "2024-06-20",
    //   status: "pending",
    //   assignedTo: null,
    //   responses: [],
    // },
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
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | number | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch inquiry list from API
  useEffect(() => {
    setLoading(true);
    fetch(API_LIST)
      .then((res) => res.json())
      .then((data) => {
        setInquiries(Array.isArray(data) ? data : data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch single inquiry when dialog opens
  useEffect(() => {
    if (selectedInquiryId) {
      setDetailLoading(true);
      fetch(API_SINGLE(selectedInquiryId))
        .then((res) => res.json())
        .then((data) => setSelectedInquiry(data?.data || data))
        .finally(() => setDetailLoading(false));
    } else {
      setSelectedInquiry(null);
    }
  }, [selectedInquiryId]);

  useEffect(() => { setPage(0); }, [searchTerm, typeFilter, inquiries]);

  // Filter logic (search and type)
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      (inquiry.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.message || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || (inquiry.enquiry_type || "").toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Unique types for filter dropdown
  const uniqueTypes = Array.from(new Set(inquiries.map((inq) => inq.enquiry_type).filter(Boolean)));

  const paginatedInquiries = filteredInquiries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filteredInquiries.length / rowsPerPage);

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

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search inquiries by name, email, or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4"
              />
            </div>
            <select
              className="w-full md:w-48 border rounded px-2 py-2 text-gray-700"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="border-0 shadow-lg">
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-2 font-medium text-gray-600">#</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Name</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Email</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Phone</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Inquiry Type</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Message</th>
                    <th className="text-left py-4 px-2 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInquiries.map((inquiry, idx) => (
                    <tr key={inquiry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>
                      <td className="py-4 px-2">{inquiry.name}</td>
                      <td className="py-4 px-2">{inquiry.email}</td>
                      <td className="py-4 px-2">{inquiry.mobile || "-"}</td>
                      <td className="py-4 px-2">
                        <Badge className="bg-blue-100 text-blue-800">{inquiry.enquiry_type}</Badge>
                      </td>
                      <td className="py-4 px-2 max-w-xs truncate" title={inquiry.message}>{inquiry.message}</td>
                      <td className="py-4 px-2">
                        <Dialog open={dialogOpen && selectedInquiryId === inquiry.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setSelectedInquiryId(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInquiryId(inquiry.id);
                                setDialogOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Inquiry Details</DialogTitle>
                            </DialogHeader>
                            {detailLoading ? (
                              <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : selectedInquiry ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border border-gray-200 rounded-lg bg-white">
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Date</td>
                                      <td className="px-4 py-2 bg-gray-50">
                                        {new Date(selectedInquiry.created_at).toLocaleDateString('en-GB')}
                                      </td>
                                    </tr>
                                    <tr className="border-b">
                                    <td className="font-medium text-gray-600 px-4 py-2">Firstname</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.name}</td>
                                    </tr>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Inquiry Type</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.enquiry_type}</td>
                                    </tr>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Email</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.email}</td>
                                    </tr>
                                    <tr className="border-b">
                                      <td className="font-medium text-gray-600 px-4 py-2">Phone</td>
                                      <td className="px-4 py-2 bg-gray-50">{selectedInquiry.mobile || "-"}</td>
                                    </tr>
                                    <tr>
                                      <td className="font-medium text-gray-600 px-4 py-2 align-top">Message</td>
                                      <td className="px-4 py-2 whitespace-pre-line bg-gray-50 rounded">{selectedInquiry.message}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-8 text-center text-gray-500">No data found.</div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td className="py-4 px-2 text-center" colSpan={6}>No inquiries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination Controls */}
          {!loading && (
            <div className="w-full flex justify-end mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <button
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  &#60;
                </button>
                <span className="font-medium">{filteredInquiries.length === 0 ? 0 : page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredInquiries.length)}</span>
                <span className="text-gray-400">of</span>
                <span className="font-semibold text-[#012765] text-base ml-2">{filteredInquiries.length}</span>
                <button
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  aria-label="Next page"
                >
                  &#62;
                </button>
                <span className="text-sm text-gray-500 ml-4">Rows per page:</span>
                <Select value={rowsPerPage === filteredInquiries.length ? 'All' : String(rowsPerPage)} onValueChange={val => {
                  if (val === 'All') {
                    setRowsPerPage(filteredInquiries.length || 1);
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
