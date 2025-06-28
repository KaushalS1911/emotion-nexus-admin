import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data and types (replace with real data fetching in production)
const mockAssessments = JSON.parse(localStorage.getItem("assessments") || "[]");

export default function AssessmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    id: Date.now(),
    userId: "",
    userName: "",
    category: "",
    date: "",
    score: 0,
    duration: "",
    recommendations: [],
    issues: [],
    questions: [],
    active: true,
    minAge: 0,
    maxAge: 0,
  });
  const [toast, setToast] = useState(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState(["", ""]);

  useEffect(() => {
    if (isEdit) {
      const stored = localStorage.getItem("assessments");
      const assessments = stored ? JSON.parse(stored) : [];
      const found = assessments.find((a) => String(a.id) === String(id));
      if (found) setForm(found);
    }
  }, [id, isEdit]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Auto-save form to localStorage when form changes (only for editing)
  useEffect(() => {
    if (isEdit && (form.userName || form.category || form.date)) {
      // Only auto-save when editing existing assessments
      const stored = localStorage.getItem("assessments");
      let assessments = stored ? JSON.parse(stored) : [];
      assessments = assessments.map((a) => (a.id === form.id ? { ...form } : a));
      localStorage.setItem("assessments", JSON.stringify(assessments));
    }
  }, [form, isEdit]);

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (!form.userName || !form.category || !form.date) {
      setToast({ type: "error", message: "Please fill all required fields." });
      return;
    }
    const stored = localStorage.getItem("assessments");
    let assessments = stored ? JSON.parse(stored) : [];
    let updated;
    if (isEdit) {
      updated = assessments.map((a) => (a.id === form.id ? { ...form } : a));
    } else {
      // Ensure unique ID for new assessments
      const newAssessment = { ...form, id: Date.now() };
      updated = [newAssessment, ...assessments];
    }
    localStorage.setItem("assessments", JSON.stringify(updated));
    setToast({ type: "success", message: isEdit ? "Assessment updated." : "Assessment added." });
    setTimeout(() => navigate("/assessments"), 800);
  };

  const handleEditQuestion = (idx) => {
    setEditingQuestionIdx(idx);
    setQuestionText(form.questions[idx].text);
    setQuestionOptions(form.questions[idx].options.length > 0 ? form.questions[idx].options : ["", ""]);
    setShowQuestionDialog(true);
  };

  const handleRemoveQuestion = (idx) => {
    const updatedQuestions = form.questions.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, questions: updatedQuestions }));
    setShowQuestionDialog(false);
    setEditingQuestionIdx(null);
    setQuestionText("");
    setQuestionOptions(["", ""]);
    setToast({ type: "success", message: "Question deleted." });
  };

  const handleSaveQuestion = () => {
    if (!questionText || questionOptions.length < 2) {
      setToast({ type: "error", message: "Please fill all required fields." });
      return;
    }
    let updatedQuestions;
    if (editingQuestionIdx === null) {
      // Add new question
      updatedQuestions = [
        ...form.questions,
        {
          text: questionText,
          options: questionOptions,
        },
      ];
    } else {
      // Edit existing question
      updatedQuestions = [
        ...form.questions.slice(0, editingQuestionIdx),
        {
          text: questionText,
          options: questionOptions,
        },
        ...form.questions.slice(editingQuestionIdx + 1),
      ];
    }
    setForm((f) => ({ ...f, questions: updatedQuestions }));
    setShowQuestionDialog(false);
    setEditingQuestionIdx(null);
    setToast({ type: "success", message: "Question saved." });
  };

  const handleAddOption = () => {
    setQuestionOptions([...questionOptions, `Option ${questionOptions.length + 1}`]);
  };

  const handleRemoveOption = (idx) => {
    const updatedOptions = questionOptions.filter((_, i) => i !== idx);
    setQuestionOptions(updatedOptions);
  };

  const handleOptionChange = (idx, value) => {
    const updatedOptions = questionOptions.map((opt, i) => i === idx ? value : opt);
    setQuestionOptions(updatedOptions);
  };

  const handleCloseDialog = () => {
    setShowQuestionDialog(false);
    setEditingQuestionIdx(null);
    setQuestionText("");
    setQuestionOptions(["", ""]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-2 text-[#FF7119]">{isEdit ? "Edit Assessment" : "Add Assessment"}</h1>
      {toast && (
        <div className={`px-4 py-2 rounded text-white font-semibold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-0 gap-4">
          <div>
            <Label htmlFor="userName">Assessment Name</Label>
            <Input id="userName" value={form.userName} onChange={e => handleFormChange('userName', e.target.value)} placeholder="Assessment name..." />
          </div>
          {/*<div>*/}
          {/*  <Label htmlFor="category">Category</Label>*/}
          {/*  <Select value={form.category} onValueChange={v => handleFormChange('category', v)}>*/}
          {/*    <SelectTrigger>*/}
          {/*      <SelectValue placeholder="Select category" />*/}
          {/*    </SelectTrigger>*/}
          {/*    <SelectContent>*/}
          {/*      <SelectItem value="K12">K12</SelectItem>*/}
          {/*      <SelectItem value="Primary">Primary</SelectItem>*/}
          {/*      <SelectItem value="Aspirant">Aspirant</SelectItem>*/}
          {/*      <SelectItem value="Employee">Employee</SelectItem>*/}
          {/*    </SelectContent>*/}
          {/*  </Select>*/}
          {/*</div>*/}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="score">Score</Label>
            <Input id="score" type="number" value={form.score} onChange={e => handleFormChange('score', Number(e.target.value))} />
          </div>
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" value={form.duration} onChange={e => handleFormChange('duration', e.target.value)} placeholder="e.g. 10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minAge">Min Age</Label>
            <Input id="minAge" type="number" value={form.minAge} onChange={e => handleFormChange('minAge', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="maxAge">Max Age</Label>
            <Input id="maxAge" type="number" value={form.maxAge} onChange={e => handleFormChange('maxAge', Number(e.target.value))} />
          </div>
        </div>
        {/* Add questions, recommendations, and issues as needed */}
        <div className="mt-8">
          <Label className="font-semibold text-lg mb-2">Questions</Label>
          <div className="space-y-4">
            {form.questions.length === 0 && (
              <div className="text-gray-400">No questions added.</div>
            )}
            {form.questions.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Q{idx + 1}: {q.text}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditQuestion(idx)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveQuestion(idx)}>Remove</Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, oIdx) => (
                    <span key={oIdx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{opt}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {!isEdit && (
            <Button className="mt-4" onClick={() => setShowQuestionDialog(true)}>+ Add Question</Button>
          )}
        </div>

        {/* Question Dialog */}
        {showQuestionDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">{editingQuestionIdx !== null ? 'Edit Question' : 'Add Question'}</h2>
              <div className="mb-4">
                <Label>Question Text</Label>
                <Input value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Enter question..." />
              </div>
              <div className="mb-4">
                <Label>Options</Label>
                {questionOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveOption(i)} disabled={questionOptions.length <= 1}>Remove</Button>
                  </div>
                ))}
                <Button size="sm" className="mt-2" onClick={handleAddOption}>+ Add Option</Button>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSaveQuestion}>{editingQuestionIdx !== null ? 'Save' : 'Add'}</Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => navigate("/assessments")}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? "Save Changes" : "Add Assessment"}</Button>
        </div>
      </div>
    </div>
  );
} 