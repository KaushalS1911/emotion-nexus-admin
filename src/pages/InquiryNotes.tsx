import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";


interface Note {
  note: string;
  createdAt: string;
  counsellor: string;
}
const API_SINGLE = (id: string | number) => `https://interactapiverse.com/mahadevasth/enquiry/${id}`;

export default function InquiryNotes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Note>({
    note: "",
    createdAt: new Date().toISOString().slice(0, 16),
    counsellor: "Admin User",
  });
  const [inquiryName, setInquiryName] = useState("");

  useEffect(() => {
    if (id) {
      const stored = localStorage.getItem(`inquiry-notes-${id}`);
      if (stored) setNotes(JSON.parse(stored));
      // Fetch inquiry name from localStorage
      const inquiriesRaw = localStorage.getItem("inquiries");
      if (inquiriesRaw) {
        try {
          const inquiries = JSON.parse(inquiriesRaw);
          console.log(inquiries,"inquiries");
          
          const found = inquiries.find((inq: any) => String(inq.id) === String(id));
          if (found && found.name) setInquiryName(found.name);
        } catch {}
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

  const handleInput = (e: any) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const handleSubmit = () => {
    const newNotes = [...notes, form];
    setNotes(newNotes);
    localStorage.setItem(`inquiry-notes-${id}`, JSON.stringify(newNotes));
    setModalOpen(false);
    setForm({ note: "", createdAt: new Date().toISOString().slice(0, 16), counsellor: "Admin User" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">Note</h1>
          <p className="text-gray-600 mt-2 text-[#012765]">All note for Inquiry #{id}</p>
        </div>
        <Button className="bg-[#012765] text-white" onClick={() => setModalOpen(true)}>
          + Add Note
        </Button>
      </div>
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Note Listing</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No notes found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiry Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counsellor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {notes.map((n, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 text-gray-900 max-w-xs whitespace-pre-line">{inquiryName}</td>
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
      <Button variant="outline" onClick={() => navigate(-1)}>
        Back
      </Button>
    </div>
  );
} 