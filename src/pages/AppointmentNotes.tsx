import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {format} from "date-fns";
import { ArrowLeft, Search } from "lucide-react";

interface Note {
    note: string;
    createdAt: string;
    counsellor: string;
}

const API_SINGLE = (id: string | number) => `https://interactapiverse.com/mahadevasth/appointments/${id}`;

export default function AppointmentNotes() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [notes, setNotes] = useState<Note[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<Note>({
        note: "",
        createdAt: new Date().toISOString().slice(0, 16),
        counsellor: "Admin User",
    });
    const [appointmentName, setAppointmentName] = useState("");
    
    // Pagination and filtering states
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({from: null, to: null});

    useEffect(() => {
        if (id) {
            const stored = localStorage.getItem(`appointment-notes-${id}`);
            if (stored) setNotes(JSON.parse(stored));
            
            // Get client name from mock data using the index
            const MOCK_APPOINTMENTS = [
                {
                    user_id: 1,
                    appointment_date: "2025-08-10",
                    slot_time: "10:00AM-11:00AM",
                    client_name: "Rahul Jain",
                    client_email: "rahul@example.com",
                    client_phone: "9876501234",
                    consultation_reason: "Exam stress and sleep issues",
                    notes: "Prefers Hindi-speaking counsellor",
                },
                {
                    user_id: 1,
                    appointment_date: "2025-08-10",
                    slot_time: "10:00AM-11:00AM",
                    client_name: "Rahul Jain",
                    client_email: "rahul@example.com",
                    client_phone: "9876501234",
                    consultation_reason: "Exam stress and sleep issues",
                    notes: "Prefers Hindi-speaking counsellor",
                },
            ];
            
            const appointmentIndex = parseInt(id as string);
            if (MOCK_APPOINTMENTS[appointmentIndex]) {
                setAppointmentName(MOCK_APPOINTMENTS[appointmentIndex].client_name);
            }
        }
    }, [id]);

    // Filter notes based on search term and date range
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.counsellor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointmentName.toLowerCase().includes(searchTerm.toLowerCase());
        
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
    };

    const handleSubmit = () => {
        const newNotes = [...notes, form];
        setNotes(newNotes);
        localStorage.setItem(`appointment-notes-${id}`, JSON.stringify(newNotes));
        setModalOpen(false);
        setForm({note: "", createdAt: new Date().toISOString().slice(0, 16), counsellor: "Admin User"});
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className=" h-4 w-4" />
                Back
            </Button>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119]">Appointments Notes</h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">All notes for Appointment #{id}</p>
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
                                placeholder="Search by note content, counsellor, or client name"
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

            <Card className="border-0 shadow-lg">
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
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedNotes.map((n, idx) => (
                                <tr
                                    key={idx}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>
                                    <td className="py-3 px-2 font-medium text-gray-800">{appointmentName}</td>
                                    <td className="py-3 px-2 text-gray-600">{n.counsellor}</td>
                                    <td className="py-3 px-2 text-gray-600">{new Date(n.createdAt).toLocaleString()}</td>
                                    <td className="py-3 px-2 text-gray-900 max-w-xs whitespace-pre-line">{n.note}</td>
                                </tr>
                            ))}
                            {filteredNotes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center text-gray-400 py-8">No notes found.</td>
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
                            <span
                                className="font-semibold text-[#012765] text-base ml-2">{filteredNotes.length}</span>
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
                                className="min-h-[80px]"
                            />
                        </div>
                        <div>
                            <Label htmlFor="createdAt">Created At</Label>
                            <Input
                                id="createdAt"
                                type="datetime-local"
                                value={form.createdAt}
                                onChange={handleInput}
                            />
                        </div>
                        <div>
                            <Label htmlFor="counsellor">Counsellor Name</Label>
                            <Input
                                id="counsellor"
                                value={form.counsellor}
                                onChange={handleInput}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} className="bg-[#FF7119] text-white">
                                Submit
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}