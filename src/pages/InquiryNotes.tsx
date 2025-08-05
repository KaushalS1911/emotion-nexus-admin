import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {ArrowLeft} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import {Search} from "lucide-react";
import { Eye } from "lucide-react";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {MoreHorizontal} from "lucide-react";


interface Note {
    note: string;
    createdAt: string;
    counsellor: string;
}

const API_SINGLE = (id: string | number) => `https://interactapiverse.com/mahadevasth/enquiry/${id}`;

export default function InquiryNotes() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<Note>({
        note: "",
        createdAt: "",
        counsellor: "Admin User",
    });
    const [inquiryName, setInquiryName] = useState("");

    // Filtering and pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({from: null, to: null});

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedNoteIdx, setSelectedNoteIdx] = useState<number | null>(null);

    // Validation states
    const [errors, setErrors] = useState<{note?: string; createdAt?: string}>({});

    useEffect(() => {
        if (id) {
            const stored = localStorage.getItem(`inquiry-notes-${id}`);
            if (stored) setNotes(JSON.parse(stored));
            // Fetch inquiry name from localStorage
            const inquiriesRaw = localStorage.getItem("inquiries");
            if (inquiriesRaw) {
                try {
                    const inquiries = JSON.parse(inquiriesRaw);
                    console.log(inquiries, "inquiries");

                    const found = inquiries.find((inq: any) => String(inq.id) === String(id));
                    if (found && found.name) setInquiryName(found.name);
                } catch {
                }
            }
        }
    }, [id]);
    useEffect(() => {
        if (id) {
            fetch(API_SINGLE(id))
                .then((res) => res.json())
                .then((data) => setInquiryName(data?.data?.name || data?.name))
        } else {
            setInquiryName("");
        }
    }, [id]);

    // Filter notes based on search term and date range
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.counsellor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiryName.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesDate = true;
        if (dateRange.from && dateRange.to) {
            const noteDate = new Date(note.createdAt);
            matchesDate = noteDate >= dateRange.from && noteDate <= dateRange.to;
        } else if (dateRange.from) {
            const noteDate = new Date(note.createdAt);
            matchesDate = noteDate >= dateRange.from;
        } else if (dateRange.to) {
            const noteDate = new Date(note.createdAt);
            matchesDate = noteDate <= dateRange.to;
        }
        return matchesSearch && matchesDate;
    });

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [searchTerm, dateRange]);

    // Paginate notes
    const paginatedNotes = filteredNotes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const totalPages = Math.ceil(filteredNotes.length / rowsPerPage);

    const handleInput = (e: any) => {
        const {id, value} = e.target;
        setForm((f) => ({...f, [id]: value}));
        
        // Clear error when user starts typing
        if (errors[id as keyof typeof errors]) {
            setErrors(prev => ({...prev, [id]: undefined}));
        }
    };

    const validateForm = () => {
        const newErrors: {note?: string; createdAt?: string} = {};
        
        if (!form.note.trim()) {
            newErrors.note = "Note is required";
        }
        
        if (!form.createdAt) {
            newErrors.createdAt = "Date and time is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
        
        const noteData = {
            ...form,
            createdAt: form.createdAt,
            counsellor: "Admin User"
        };
        
        const newNotes = [...notes, noteData];
        setNotes(newNotes);
        localStorage.setItem(`inquiry-notes-${id}`, JSON.stringify(newNotes));
        setModalOpen(false);
        setForm({note: "", createdAt: "", counsellor: "Admin User"});
        setErrors({});
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className=" h-4 w-4"/>
                Back
            </Button>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119]">Inquiries Notes</h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">All notes for Inquiry #{id}</p>
                </div>
                <Button className="bg-[#012765] text-white" onClick={() => setModalOpen(true)}>
                    + Add Note
                </Button>
            </div>
            {/* Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <Input
                                placeholder="Search by note content, counsellor, or Client Name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-80 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left">
                                            {dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "From"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.from ?? undefined}
                                            onSelect={(date) => setDateRange(r => ({...r, from: date ?? null}))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <span className="mx-1">-</span>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left">
                                            {dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "To"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateRange.to ?? undefined}
                                            onSelect={(date) => setDateRange(r => ({...r, to: date ?? null}))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white">
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100 text-left text-gray-600">
                                <th className="text-left py-4 px-2 font-medium text-gray-600">#</th>
                                <th className="py-3 px-2">Client Name</th>
                                <th className="py-3 px-2">Counsellor Name</th>
                                <th className="py-3 px-2">Created At</th>
                                <th className="py-3 px-2">Note</th>
                                <th className="py-3 px-2">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedNotes.map((n, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>
                                    <td className="py-3 px-2 font-medium text-gray-800">{inquiryName}</td>
                                    <td className="py-3 px-2 text-gray-600">{n.counsellor}</td>
                                    <td className="py-3 px-2 text-gray-600">{new Date(n.createdAt).toLocaleString()}</td>
                                    <td className="py-3 px-2 text-gray-900 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis" style={{maxWidth: 150}} title={n.note}>{n.note}</td>
                                    <td className="py-3 px-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" aria-label="Actions">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedNoteIdx(idx);
                                                        setViewDialogOpen(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" /> View
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                            {filteredNotes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center text-gray-400 py-8">No notes found.</td>
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
                            <span
                                className="font-medium">{filteredNotes.length === 0 ? 0 : page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredNotes.length)}</span>
                            <span className="text-gray-400">of</span>
                            <span className="font-semibold text-[#012765] text-base ml-2">{filteredNotes.length}</span>
                            <button
                                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Next page"
                            >
                                &#62;
                            </button>
                            <span className="text-sm text-gray-500 ml-4">Rows per page:</span>
                            <Select value={rowsPerPage === filteredNotes.length ? 'All' : String(rowsPerPage)}
                                    onValueChange={val => {
                                        if (val === 'All') {
                                            setRowsPerPage(filteredNotes.length || 1);
                                            setPage(0);
                                        } else {
                                            setRowsPerPage(Number(val));
                                            setPage(0);
                                        }
                                    }}>
                                <SelectTrigger
                                    className="w-16 h-8 border-gray-200 rounded-md shadow-sm text-gray-700 text-sm focus:ring-2 ">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent className="w-16 rounded-md shadow-lg border-gray-200">
                                    <SelectItem value="5"
                                                className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">5</SelectItem>
                                    <SelectItem value="10"
                                                className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">10</SelectItem>
                                    <SelectItem value="25"
                                                className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">25</SelectItem>
                                    <SelectItem value="All"
                                                className="text-gray-800 data-[state=checked]:bg-gray-200 data-[state=checked]:text-black [&>[data-select-item-indicator]]:hidden">All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="note">Note</Label>
                            <Textarea
                                id="note"
                                value={form.note}
                                onChange={handleInput}
                                placeholder="Enter note..."
                                className={`min-h-[80px] ${errors.note ? 'border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.note && (
                                <p className="text-red-500 text-sm mt-1">{errors.note}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="createdAt">Created At</Label>
                            <Input
                                id="createdAt"
                                type="datetime-local"
                                value={form.createdAt}
                                onChange={handleInput}
                                placeholder="Select date and time"
                                className={errors.createdAt ? 'border-red-500 focus:ring-red-500' : ''}
                            />
                            {errors.createdAt && (
                                <p className="text-red-500 text-sm mt-1">{errors.createdAt}</p>
                            )}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setModalOpen(false);
                                setErrors({});
                                setForm({note: "", createdAt: "", counsellor: "Admin User"});
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} className="bg-[#FF7119] text-white">
                                Submit
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">Note Details</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={() => setViewDialogOpen(false)} className="h-8 w-8 p-0">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M18 6 6 18M6 6l12 12"/></svg>
                        </Button>
                    </div>
                    {selectedNoteIdx !== null && paginatedNotes[selectedNoteIdx] && (() => {
                        const selectedNote = paginatedNotes[selectedNoteIdx];
                        return (
                            <div>
                                <table className="min-w-full text-sm border border-gray-300 rounded-lg bg-white">
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="w-1/3 px-4 py-3 font-medium text-gray-700 border-r">Client Name</td>
                                            <td className="w-2/3 px-4 py-3 text-gray-900">{inquiryName}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="w-1/3 px-4 py-3 font-medium text-gray-700 border-r">Counsellor Name</td>
                                            <td className="w-2/3 px-4 py-3 text-gray-900">{selectedNote.counsellor}</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="w-1/3 px-4 py-3 font-medium text-gray-700 border-r">Created At</td>
                                            <td className="w-2/3 px-4 py-3 text-gray-900">{new Date(selectedNote.createdAt).toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td className="w-1/3 px-4 py-3 font-medium text-gray-700 align-top border-r">Note</td>
                                            <td className="w-2/3 px-4 py-3 text-gray-900">
                                                <div className="max-h-[400px] overflow-y-auto whitespace-pre-line">{selectedNote.note}</div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>

        </div>
    );
} 