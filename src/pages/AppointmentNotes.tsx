import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

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
                    <h1 className="text-3xl font-bold text-[#FF7119]">Notes</h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">All notes for Appointment #{id}</p>
                </div>
                <Button className="bg-[#012765] text-white" onClick={() => setModalOpen(true)}>
                    + Add Note
                </Button>
            </div>
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="text-[#012765]">
                    <CardTitle>Note Listing</CardTitle>
                </CardHeader>
                <CardContent>
                    {notes.length === 0 ? (
                        <div className="text-gray-400 text-center py-8">No notes found.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counsellor
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created
                                    At
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            {notes.map((n, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 text-gray-900 max-w-xs whitespace-pre-line">{appointmentName}</td>
                                    <td className="px-4 py-2 text-gray-700">{n.counsellor}</td>
                                    <td className="px-4 py-2 text-gray-900 max-w-xs whitespace-pre-line">{n.note}</td>
                                    <td className="px-4 py-2 text-gray-700">{new Date(n.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
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