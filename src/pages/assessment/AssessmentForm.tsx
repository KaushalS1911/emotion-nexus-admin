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
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [editingRecommendationIdx, setEditingRecommendationIdx] = useState(null);
  const [recommendationText, setRecommendationText] = useState("");
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [editingIssueIdx, setEditingIssueIdx] = useState(null);
  const [issueText, setIssueText] = useState("");

  useEffect(() => {
    if (isEdit) {
      const stored = localStorage.getItem("assessments");
      const assessments = stored ? JSON.parse(stored) : [];
      const found = assessments.find((a) => String(a.id) === String(id));
      if (found) setForm(found);
    } else {
      // Reset form to initial blank values in Add mode
      setForm({
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
    if (!form.userName || !form.date) {
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

  // Question handlers
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

  // Recommendation handlers
  const handleEditRecommendation = (idx) => {
    setEditingRecommendationIdx(idx);
    setRecommendationText(form.recommendations[idx]);
    setShowRecommendationDialog(true);
  };

  const handleRemoveRecommendation = (idx) => {
    const updatedRecommendations = form.recommendations.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, recommendations: updatedRecommendations }));
    setShowRecommendationDialog(false);
    setEditingRecommendationIdx(null);
    setRecommendationText("");
    setToast({ type: "success", message: "Recommendation deleted." });
  };

  const handleSaveRecommendation = () => {
    if (!recommendationText.trim()) {
      setToast({ type: "error", message: "Please enter a recommendation." });
      return;
    }
    let updatedRecommendations;
    if (editingRecommendationIdx === null) {
      // Add new recommendation
      updatedRecommendations = [...form.recommendations, recommendationText.trim()];
    } else {
      // Edit existing recommendation
      updatedRecommendations = [
        ...form.recommendations.slice(0, editingRecommendationIdx),
        recommendationText.trim(),
        ...form.recommendations.slice(editingRecommendationIdx + 1),
      ];
    }
    setForm((f) => ({ ...f, recommendations: updatedRecommendations }));
    setShowRecommendationDialog(false);
    setEditingRecommendationIdx(null);
    setToast({ type: "success", message: "Recommendation saved." });
  };

  // Issue handlers
  const handleEditIssue = (idx) => {
    setEditingIssueIdx(idx);
    setIssueText(form.issues[idx]);
    setShowIssueDialog(true);
  };

  const handleRemoveIssue = (idx) => {
    const updatedIssues = form.issues.filter((_, i) => i !== idx);
    setForm((f) => ({ ...f, issues: updatedIssues }));
    setShowIssueDialog(false);
    setEditingIssueIdx(null);
    setIssueText("");
    setToast({ type: "success", message: "Issue deleted." });
  };

  const handleSaveIssue = () => {
    if (!issueText.trim()) {
      setToast({ type: "error", message: "Please enter an issue." });
      return;
    }
    let updatedIssues;
    if (editingIssueIdx === null) {
      // Add new issue
      updatedIssues = [...form.issues, issueText.trim()];
    } else {
      // Edit existing issue
      updatedIssues = [
        ...form.issues.slice(0, editingIssueIdx),
        issueText.trim(),
        ...form.issues.slice(editingIssueIdx + 1),
      ];
    }
    setForm((f) => ({ ...f, issues: updatedIssues }));
    setShowIssueDialog(false);
    setEditingIssueIdx(null);
    setToast({ type: "success", message: "Issue saved." });
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

  const handleCloseRecommendationDialog = () => {
    setShowRecommendationDialog(false);
    setEditingRecommendationIdx(null);
    setRecommendationText("");
  };

  const handleCloseIssueDialog = () => {
    setShowIssueDialog(false);
    setEditingIssueIdx(null);
    setIssueText("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-2 text-[#FF7119]">{isEdit ? "Edit Assessment" : "Add Assessment"}</h1>
      <p className="text-gray-500 mb-6">{isEdit ? "Update the details of this assessment." : "Fill in the details to create a new assessment."}</p>
      {toast && (
        <div className={`px-4 py-2 rounded text-white font-semibold ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}

      {/* Assessment Info */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-semibold text-[#012765] mb-1">Assessment Info</h2>
        <p className="text-gray-400 mb-4">Basic information about the assessment.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="userName">Assessment Name</Label>
            <Input id="userName" value={form.userName} onChange={e => handleFormChange('userName', e.target.value)} placeholder="Assessment name..." />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="score">Score</Label>
            <Input id="score" type="number" value={form.score} onChange={e => handleFormChange('score', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="duration">Duration (min)</Label>
            <Input id="duration" value={form.duration} onChange={e => handleFormChange('duration', e.target.value)} placeholder="e.g. 10" />
          </div>
          <div>
            <Label htmlFor="minAge">Min Age</Label>
            <Input id="minAge" type="number" value={form.minAge} onChange={e => handleFormChange('minAge', Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="maxAge">Max Age</Label>
            <Input id="maxAge" type="number" value={form.maxAge} onChange={e => handleFormChange('maxAge', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-xl font-semibold text-[#012765] mb-1">Questions</h2>
        <p className="text-gray-400 mb-4">Add or edit the questions for this assessment.</p>
        <div className="space-y-4">
          {form.questions.length === 0 && (
            <div className="text-gray-400">No questions added.</div>
          )}
          {form.questions.map((q, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 font-medium whitespace-pre-line break-words overflow-x-auto max-w-full min-h-[44px] group-hover:shadow-md transition-shadow">
                <span className="font-semibold text-[#FF7119]">Q{idx + 1}:</span> {q.text}
                <div className="flex flex-wrap gap-2 mt-2">
                  {q.options.map((opt, oIdx) => (
                    <span key={oIdx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{opt}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-2">
                <Button size="sm" variant="outline" onClick={() => handleEditQuestion(idx)} className="transition-colors">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveQuestion(idx)} className="transition-colors">Remove</Button>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => {
          setShowQuestionDialog(true);
          setEditingQuestionIdx(null);
          setQuestionText("");
          setQuestionOptions(["", ""]);
        }}>+ Add Question</Button>
      </div>

      {/* Recommendation Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-xl font-semibold text-green-800 mb-1">Recommendations</h2>
        <p className="text-gray-400 mb-4">Suggestions for improvement or next steps.</p>
        <div className="space-y-4">
          {form.recommendations.length === 0 && (
            <div className="text-gray-400">No recommendations added.</div>
          )}
          {form.recommendations.map((r, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-gray-900 font-medium whitespace-pre-line break-words overflow-x-auto max-w-full min-h-[44px] group-hover:shadow-md transition-shadow">
                {r}
              </div>
              <div className="flex gap-2 ml-2">
                <Button size="sm" variant="outline" onClick={() => handleEditRecommendation(idx)} className="transition-colors">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveRecommendation(idx)} className="transition-colors">Remove</Button>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => {
          setShowRecommendationDialog(true);
          setEditingRecommendationIdx(null);
          setRecommendationText("");
        }}>+ Add Recommendation</Button>
      </div>

      {/* Issues Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-xl font-semibold text-red-800 mb-1">Issues</h2>
        <p className="text-gray-400 mb-4">Challenges or concerns identified in the assessment.</p>
        <div className="space-y-4">
          {form.issues.length === 0 && (
            <div className="text-gray-400">No issues added.</div>
          )}
          {form.issues.map((i, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-gray-900 font-medium whitespace-pre-line break-words overflow-x-auto max-w-full min-h-[44px] group-hover:shadow-md transition-shadow">
                {i}
              </div>
              <div className="flex gap-2 ml-2">
                <Button size="sm" variant="outline" onClick={() => handleEditIssue(idx)} className="transition-colors">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemoveIssue(idx)} className="transition-colors">Remove</Button>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={() => {
          setShowIssueDialog(true);
          setEditingIssueIdx(null);
          setIssueText("");
        }}>+ Add Issue</Button>
      </div>

      {/* Dialogs and Actions */}
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
      {showRecommendationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingRecommendationIdx !== null ? 'Edit Recommendation' : 'Add Recommendation'}</h2>
            <div className="mb-4">
              <Label>Recommendation</Label>
              <Input value={recommendationText} onChange={e => setRecommendationText(e.target.value)} placeholder="Enter recommendation..." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseRecommendationDialog}>Cancel</Button>
              <Button onClick={handleSaveRecommendation}>{editingRecommendationIdx !== null ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}
      {showIssueDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingIssueIdx !== null ? 'Edit Issue' : 'Add Issue'}</h2>
            <div className="mb-4">
              <Label>Issue</Label>
              <Input value={issueText} onChange={e => setIssueText(e.target.value)} placeholder="Enter issue..." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCloseIssueDialog}>Cancel</Button>
              <Button onClick={handleSaveIssue}>{editingIssueIdx !== null ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end mt-8">
        <Button variant="outline" onClick={() => navigate("/assessments")}>Cancel</Button>
        <Button onClick={handleSave}>{isEdit ? "Save Changes" : "Add Assessment"}</Button>
      </div>
    </div>
  );
} 