"use client";

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {
    Search,
    Calendar,
    TrendingUp,
    FileText,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";

// Type Definitions
interface Assessment {
    id: number;
    userId: string;
    userName: string;
    category: string;
    date: string;
    score: number;
    duration: string;
    recommendations: string[];
    issues: string[];
    minAge: number;
    maxAge: number;
}

interface Question {
    text: string;
    options: string[];
}

interface AssessmentWithQuestions extends Assessment {
    questions: Question[];
    active?: boolean;
}

const mockAssessments: Assessment[] = [
    {
        id: 1,
        userId: "sarah.j@email.com",
        userName: "Competitive Exam Stress",
        category: "K12",
        date: "2024-06-23",
        score: 85,
        duration: "10 min",
        recommendations: ["Stress management techniques", "Mindfulness exercises"],
        issues: ["Mild anxiety", "Sleep concerns"],
        minAge: 10,
        maxAge: 12,
    },
    {
        id: 2,
        userId: "m.chen@email.com",
        userName: "General Stress & Anxiety",
        category: "Employee",
        date: "2024-06-22",
        score: 78,
        duration: "6 min",
        recommendations: ["Work-life balance", "Communication skills"],
        issues: ["Work stress", "Time management"],
        minAge: 20,
        maxAge: 30,
    },
    {
        id: 3,
        userId: "emma.w@email.com",
        userName: "Emotional Awareness & Regulation",
        category: "Aspirant",
        date: "2024-06-21",
        score: 82,
        duration: "7 min",
        recommendations: ["Goal setting", "Confidence building"],
        issues: ["Exam anxiety", "Self-doubt"],
        minAge: 18,
        maxAge: 20,
    },
    {
        id: 4,
        userId: "d.kumar@email.com",
        userName: "Academic Stress",
        category: "Primary",
        date: "2024-06-20",
        score: 91,
        duration: "10 min",
        recommendations: ["Continue positive habits", "Social activities"],
        issues: ["Minor social concerns"],
        minAge: 8,
        maxAge: 10,
    },
    {
        id: 5,
        userId: "d.kumar@email.com",
        userName: "Self-Esteem Scale for Pre-Adolescents",
        category: "Primary",
        date: "2024-06-19",
        score: 88,
        duration: "10 min",
        recommendations: ["Positive reinforcement", "Group interaction"],
        issues: ["Confidence building"],
        minAge: 10,
        maxAge: 12,
    },
    {
        id: 6,
        userId: "d.kumar@email.com",
        userName: "Work-Life Balance",
        category: "Employee",
        date: "2024-06-18",
        score: 74,
        duration: "7 min",
        recommendations: ["Delegation training"],
        issues: ["Overworking", "Lack of boundaries"],
        minAge: 25,
        maxAge: 35,
    },
    {
        id: 7,
        userId: "d.kumar@email.com",
        userName: "Child Learning Ability",
        category: "Employee",
        date: "2024-06-18",
        score: 74,
        duration: "13 min",
        recommendations: ["Delegation training"],
        issues: ["Overworking", "Lack of boundaries"],
        minAge: 10,
        maxAge: 15,
    },
];

const scoreDistributionData = [
    {range: "0-20", count: 12},
    {range: "21-40", count: 45},
    {range: "41-60", count: 156},
    {range: "61-80", count: 289},
    {range: "81-100", count: 178},
];

const weeklyAssessmentData = [
    {week: "Week 1", assessments: 245},
    {week: "Week 2", assessments: 289},
    {week: "Week 3", assessments: 312},
    {week: "Week 4", assessments: 298},
    {week: "Week 5", assessments: 334},
    {week: "Week 6", assessments: 367},
];

export const AssessmentData = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [assessments, setAssessments] = useState<AssessmentWithQuestions[]>([...mockAssessments.map(a => ({
        ...a,
        questions: [],
        active: true
    }))]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<AssessmentWithQuestions>({
        id: 0,
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
    const [viewing, setViewing] = useState<AssessmentWithQuestions | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

    const filteredAssessments = assessments.filter((assessment) => {
        const matchesSearch =
            assessment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assessment.userId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            categoryFilter === "all" || assessment.category === categoryFilter;
        return matchesSearch && matchesCategory && assessment.active !== false;
    });

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 bg-green-100";
        if (score >= 60) return "text-yellow-600 bg-yellow-100";
        return "text-red-600 bg-red-100";
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            K12: "bg-purple-100 text-purple-800",
            Primary: "bg-blue-100 text-blue-800",
            Aspirant: "bg-green-100 text-green-800",
            Employee: "bg-orange-100 text-orange-800",
        };
        return colors[category] || "bg-gray-100 text-gray-800";
    };

    // Dialog handlers
    const openAddDialog = () => {
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
        setIsEdit(false);
        setIsDialogOpen(true);
    };
    const openEditDialog = (assessment: AssessmentWithQuestions) => {
        setForm({...assessment});
        setIsEdit(true);
        setIsDialogOpen(true);
    };
    const openViewDialog = (assessment: AssessmentWithQuestions) => {
        setViewing(assessment);
    };
    const closeDialog = () => {
        setIsDialogOpen(false);
        setIsEdit(false);
    };
    // Form handlers
    const handleFormChange = (field: keyof AssessmentWithQuestions, value: any) => {
        setForm(f => ({...f, [field]: value}));
    };
    // Questions logic
    const addQuestion = () => {
        setForm(f => ({...f, questions: [...f.questions, {text: "", options: [""]}]}));
    };
    const updateQuestion = (idx: number, field: "text" | "options", value: any) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) =>
                i === idx ? {...q, [field]: value} : q
            ),
        }));
    };
    const addOption = (qIdx: number) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) =>
                i === qIdx ? {...q, options: [...q.options, ""]} : q
            ),
        }));
    };
    const updateOption = (qIdx: number, oIdx: number, value: string) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) =>
                i === qIdx
                    ? {...q, options: q.options.map((opt, j) => (j === oIdx ? value : opt))}
                    : q
            ),
        }));
    };
    const removeOption = (qIdx: number, oIdx: number) => {
        setForm(f => ({
            ...f,
            questions: f.questions.map((q, i) =>
                i === qIdx
                    ? {...q, options: q.options.filter((_, j) => j !== oIdx)}
                    : q
            ),
        }));
    };
    // Save/Add assessment
    const handleSave = () => {
        if (!form.userName || !form.category || !form.date) {
            setToast({type: "error", message: "Please fill all required fields."});
            return;
        }
        if (isEdit) {
            setAssessments(prev => prev.map(a => a.id === form.id ? {...form} : a));
            setToast({type: "success", message: "Assessment updated successfully."});
        } else {
            setAssessments(prev => [{...form}, ...prev]);
            setToast({type: "success", message: "Assessment added successfully."});
        }
        setIsDialogOpen(false);
    };
    // Deactivate
    const handleDeactivate = (id: number) => {
        setAssessments(prev => prev.map(a => a.id === id ? {...a, active: false} : a));
        setToast({type: "info", message: "Assessment deactivated."});
    };
    // Toast auto-hide
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    // 1. On initial load, check localStorage for 'assessments' and use it if present; otherwise, use mockAssessments.
    useEffect(() => {
        const stored = localStorage.getItem("assessments");
        if (stored) {
            setAssessments(JSON.parse(stored));
        }
    }, []);
    // 2. On every change to assessments, save it to localStorage.
    useEffect(() => {
        localStorage.setItem("assessments", JSON.stringify(assessments));
    }, [assessments]);

    return (
        <div className="space-y-6">
            {/* Toast/Alert */}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>{toast.message}</div>
            )}
            {/* Add/Edit Assessment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Assessment' : 'Add Assessment'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="userName">Assessment Name</Label>
                                <Input id="userName" value={form.userName}
                                       onChange={e => handleFormChange('userName', e.target.value)}
                                       placeholder="Assessment name..."/>
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={form.category} onValueChange={v => handleFormChange('category', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="K12">K12</SelectItem>
                                        <SelectItem value="Primary">Primary</SelectItem>
                                        <SelectItem value="Aspirant">Aspirant</SelectItem>
                                        <SelectItem value="Employee">Employee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" value={form.date}
                                       onChange={e => handleFormChange('date', e.target.value)}/>
                            </div>
                            <div>
                                <Label htmlFor="score">Score</Label>
                                <Input id="score" type="number" value={form.score}
                                       onChange={e => handleFormChange('score', Number(e.target.value))}/>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" value={form.duration}
                                   onChange={e => handleFormChange('duration', e.target.value)}
                                   placeholder="e.g. 10"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="minAge">Min Age</Label>
                                <Input id="minAge" type="number" value={form.minAge}
                                       onChange={e => handleFormChange('minAge', Number(e.target.value))}/>
                            </div>
                            <div>
                                <Label htmlFor="maxAge">Max Age</Label>
                                <Input id="maxAge" type="number" value={form.maxAge}
                                       onChange={e => handleFormChange('maxAge', Number(e.target.value))}/>
                            </div>
                        </div>
                        {/* Questions Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Questions</Label>
                                <Button size="sm" variant="outline" onClick={addQuestion}>+ Add Question</Button>
                            </div>
                            <div className="space-y-4">
                                {form.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="border rounded-lg p-3 bg-gray-50">
                                        <div className="mb-2">
                                            <Label>Question {qIdx + 1}</Label>
                                            <Input value={q.text}
                                                   onChange={e => updateQuestion(qIdx, 'text', e.target.value)}
                                                   placeholder="Question text..."/>
                                        </div>
                                        <div>
                                            <Label>Options</Label>
                                            <div className="space-y-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <Input value={opt}
                                                               onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                                                               placeholder={`Option ${oIdx + 1}`}/>
                                                        {q.options.length > 1 && (
                                                            <Button size="icon" variant="ghost"
                                                                    onClick={() => removeOption(qIdx, oIdx)}
                                                                    title="Remove option">
                                                                ×
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="outline" onClick={() => addOption(qIdx)}>+
                                                    Add Option</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                            <Button onClick={handleSave}>{isEdit ? 'Save Changes' : 'Add Assessment'}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* View Profile Dialog */}
            <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Assessment Details :</DialogTitle>
                    </DialogHeader>
                    <hr className="my-2 border-gray-200"/>
                    {viewing && (
                        <div className="space-y-4">
                            <div className="mb-6">
                                <div className="font-semibold text-lg mb-2">Main Info :</div>
                                <div className="bg-gray-900 p-4 rounded-md text-sm font-mono text-left space-y-1">
                                    <div>
                                        <span className="text-pink-500">Assessment Name :</span>
                                        <span className="text-teal-400">{viewing.userName}</span>
                                    </div>
                                    <div>
                                        <span className="text-pink-500">Category :</span>
                                        <span className="text-teal-400">{viewing.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-pink-500">Date :</span>
                                        <span
                                            className="text-teal-400">{new Date(viewing.date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-pink-500">Score :</span>
                                        <span className="text-teal-400">{viewing.score}</span>
                                    </div>
                                    <div>
                                        <span className="text-pink-500">Duration :</span>
                                        <span className="text-teal-400">{viewing.duration} min</span>
                                    </div>
                                    <div>
                                        <span className="text-pink-500">Age Group :</span>
                                        <span className="text-teal-400">
                                       {viewing.maxAge && viewing.maxAge !== viewing.minAge
                                           ? `${viewing.minAge}-${viewing.maxAge} age group`
                                           : `${viewing.minAge} age group`}
                                     </span>
                                    </div>
                                </div>

                            </div>
                            <hr className="my-4 border-gray-200"/>
                            <div>
                                <div className="font-semibold mb-2">Questions :</div>
                                <div className="space-y-3">{viewing.questions.length === 0 &&
                                    <div className="text-gray-400">No questions added.</div>
                                }
                                    {viewing.questions.map((q, qIdx) => (
                                        <div key={qIdx} className="border rounded-lg p-3 bg-gray-50">
                                            <div className="font-semibold mb-3">Q{qIdx + 1} : {q.text}</div>
                                            <div className="flex flex-wrap gap-2">{q.options.map((opt, oIdx) => (
                                                <Badge key={oIdx}
                                                       className="bg-gray-100 text-gray-700">{opt}</Badge>))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                                <Button variant="outline" onClick={() => {
                                    setViewing(null);
                                }}>
                                    <X className="h-4 w-4 mr-1"/> Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119]">
                        Assessment Data
                    </h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">
                        Monitor assessment results and insights
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Button className="bg-[#012765] text-white" onClick={openAddDialog}>
                        + Add Assessment
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">
                                    Total Assessments
                                </p>
                                <p className="text-2xl font-bold text-blue-700">12,847</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Avg. Score</p>
                                <p className="text-2xl font-bold text-green-700">78.5</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">
                                    This Week
                                </p>
                                <p className="text-2xl font-bold text-purple-700">367</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">
                                    Completion Rate
                                </p>
                                <p className="text-2xl font-bold text-orange-700">94.2%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500"/>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Score Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={scoreDistributionData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="range"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="count" fill="#012765" radius={[4, 4, 0, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle>Weekly Assessment Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyAssessmentData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="week"/>
                                <YAxis/>
                                <Tooltip/>
                                <Line
                                    type="monotone"
                                    dataKey="assessments"
                                    stroke="#012765"
                                    strokeWidth={3}
                                    dot={{fill: '#FF7119', strokeWidth: 2, r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <Input
                                placeholder="Search by name or email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Category"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="K12">K12 Students</SelectItem>
                                <SelectItem value="Primary">Primary Students</SelectItem>
                                <SelectItem value="Aspirant">Aspirants</SelectItem>
                                <SelectItem value="Employee">Employees</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Assessments ({filteredAssessments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100 text-left text-gray-600">
                                <th className="py-3 px-2">Assessment Name</th>
                                <th className="py-3 px-2">Category</th>
                                <th className="py-3 px-2">Age</th>
                                <th className="py-3 px-2">Score</th>
                                <th className="py-3 px-2">Duration</th>
                                <th className="py-3 px-2">Date</th>
                                <th className="py-3 px-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAssessments.map((assessment) => (
                                <tr
                                    key={`${assessment.id}-${assessment.userName}`}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-3 px-2 font-medium text-gray-800">
                                        {assessment.userName}
                                    </td>
                                    <td className="py-3 px-2">
                                        <Badge className={getCategoryColor(assessment.category)}>
                                            {assessment.category}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-2">
                                        <Badge
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{assessment.maxAge && assessment.maxAge !== assessment.minAge ? `${assessment.minAge}-${assessment.maxAge} age group` : `${assessment.minAge} age group`}</Badge>
                                    </td>
                                    <td className="py-3 px-2">
                                        <Badge className={getScoreColor(assessment.score)}>
                                            {assessment.score}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">
                                        {assessment.duration} min
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">
                                        {new Date(assessment.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openViewDialog(assessment)}
                                                                  className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4"/> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditDialog(assessment)}
                                                                  className="flex items-center gap-2">
                                                    <Pencil className="h-4 w-4"/> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 flex items-center gap-2"
                                                                  onClick={() => handleDeactivate(assessment.id)}>
                                                    <Trash2 className="h-4 w-4"/> Deactivate
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
