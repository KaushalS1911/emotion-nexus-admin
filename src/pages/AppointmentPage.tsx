import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Search, MoreHorizontal, Pencil, Trash2} from "lucide-react";

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
    // Add more mock data as needed
];

const ROWS_PER_PAGE = 5;

export default function AppointmentPage() {
    const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const filtered = appointments.filter((a) => {
        const matchesSearch =
            a.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.client_phone.includes(searchTerm);
        const matchesDateFrom = !dateFrom || a.appointment_date >= dateFrom;
        const matchesDateTo = !dateTo || a.appointment_date <= dateTo;
        return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    const handleEdit = (appt, idx) => {
        setEditing({...appt, idx});
        setEditModalOpen(true);
    };

    const handleDelete = (appt) => {
        setAppointments(appointments.filter(a => a !== appt));
    };

    const handleEditChange = (e) => {
        setEditing({...editing, notes: e.target.value});
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        // PATCH API call
        const appointmentId = editing.idx; // Use idx as temporary id
        await fetch(`https://interactapiverse.com/mahadevasth/appointments/${appointmentId}/notes`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({notes: editing.notes}),
        });
        setAppointments(appointments.map((a, i) => i === appointmentId ? {...a, notes: editing.notes} : a));
        setEditModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119]">Appointments</h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">Manage and view all your scheduled appointments</p>
                </div>
            </div>
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <Input
                                placeholder="Search by client name, email, or phone"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="md:w-48"
                            placeholder="From date"
                        />
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="md:w-48"
                            placeholder="To date"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100 text-left text-gray-600">
                                {/*<th className="py-4 px-2 font-medium">#</th>*/}
                                <th className="py-4 px-2 font-medium">User ID</th>
                                <th className="py-4 px-2 font-medium">Date</th>
                                <th className="py-4 px-2 font-medium">Slot</th>
                                <th className="py-4 px-2 font-medium">Client Name</th>
                                <th className="py-4 px-2 font-medium">Email</th>
                                <th className="py-4 px-2 font-medium">Phone</th>
                                <th className="py-4 px-2 font-medium">Reason</th>
                                <th className="py-4 px-2 font-medium">Notes</th>
                                <th className="py-4 px-2 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center text-gray-400 py-8">No appointments found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((a, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        {/*<td className="py-4 px-2">{page * rowsPerPage + idx + 1}</td>*/}
                                        <td className="py-4 px-2">{a.user_id}</td>
                                        <td className="py-4 px-2">{a.appointment_date}</td>
                                        <td className="py-4 px-2">{a.slot_time}</td>
                                        <td className="py-4 px-2">{a.client_name}</td>
                                        <td className="py-4 px-2">{a.client_email}</td>
                                        <td className="py-4 px-2">{a.client_phone}</td>
                                        <td className="py-4 px-2">{a.consultation_reason}</td>
                                        <td className="py-4 px-2">{a.notes}</td>
                                        <td className="py-4 px-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(a, idx)}
                                                                      className="flex items-center gap-2">
                                                        <Pencil className="h-4 w-4"/> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(a)}
                                                                      className="text-red-600 flex items-center gap-2">
                                                        <Trash2 className="h-4 w-4"/> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
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
                                className="font-medium">{filtered.length === 0 ? 0 : page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filtered.length)}</span>
                            <span className="text-gray-400">of</span>
                            <span className="font-semibold text-[#012765] text-base ml-2">{filtered.length}</span>
                            <button
                                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Next page"
                            >
                                &#62;
                            </button>
                            <span className="text-sm text-gray-500 ml-4">Rows per page:</span>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={rowsPerPage}
                                onChange={e => {
                                    setRowsPerPage(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="w-16 h-8 border-gray-200 rounded-md shadow-sm text-gray-700 text-sm focus:ring-2"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-lg p-0  rounded-2xl">
                    <form onSubmit={handleEditSave} className="p-8 flex flex-col gap-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center text-[#012765]">Edit
                                Notes</DialogTitle>
                        </DialogHeader>
                        <label className="font-semibold text-gray-700">
                            Notes
                            <textarea
                                name="notes"
                                value={editing?.notes || ''}
                                onChange={handleEditChange}
                                rows={3}
                                className="mt-1 w-full border rounded px-3 py-2 text-gray-800"
                            />
                        </label>

                        <div className="flex justify-between mt-6">
                            <Button type="button" variant="outline" className="text-[#012765]"
                                    onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit"
                                    className="bg-[#FF7119] text-white px-8 py-2 font-bold rounded-md shadow">Save</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
} 