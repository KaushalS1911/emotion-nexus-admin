import {useState, useRef, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Search,
    Plus,
    Eye,
    Heart,
    BookOpen,
    Video,
    FileText,
    Edit,
    Trash2,
    MoreVertical,
    TrendingUp, FilePen
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import {DateInputButton} from "@/components/ui/DatePickerDialog";
import {X} from "lucide-react"
import {useNavigate} from "react-router-dom";

type ResourceFormErrors = {
    title?: string;
    author?: string;
    type?: string;
    category?: string;
    platform?: string;
    age?: string;
    description?: string;
    tags?: string;
    thumbnail?: string;
    emptyImage?: string;
};

const mockResources = [
    {
        id: 1,
        title: "5 Breathing Techniques for Instant Stress Relief",
        type: "article",
        category: "stress-management",
        author: "Dr. Sarah Wilson",
        publishDate: "2024-06-20",
        views: 1247,
        likes: 89,
        status: "live",
        description: "Learn simple yet effective breathing techniques that can help you manage stress and anxiety in just a few minutes.",
        tags: ["breathing", "stress", "anxiety", "mindfulness"],
        thumbnail: null,
        emptyImage: null,
        platform: "website",
        age: "18+",
    },
    {
        id: 2,
        title: "Mindfulness Meditation for Beginners",
        type: "video",
        category: "mindfulness",
        author: "Wellness Team",
        publishDate: "2024-06-18",
        views: 2156,
        likes: 156,
        status: "live",
        description: "A 10-minute guided meditation session perfect for those new to mindfulness practice.",
        tags: ["meditation", "mindfulness", "beginners", "guided"],
        thumbnail: null,
        emptyImage: null,
        platform: "app",
        age: "13+",
    },
    {
        id: 3,
        title: "Exam Anxiety: A Complete Guide",
        type: "article",
        category: "exam-prep",
        author: "Prof. Michael Chen",
        publishDate: "2024-06-15",
        views: 892,
        likes: 67,
        status: "hide",
        description: "Comprehensive strategies to overcome exam anxiety and improve academic performance.",
        tags: ["exams", "anxiety", "students", "performance"],
        thumbnail: null,
        emptyImage: null,
        platform: "both",
        age: "16+",
    },
    {
        id: 4,
        title: "Workplace Stress Management Tips",
        type: "tip",
        category: "workplace",
        author: "HR Team",
        publishDate: "2024-06-12",
        views: 1456,
        likes: 98,
        status: "draft",
        description: "Practical tips for managing stress in professional environments.",
        tags: ["workplace", "stress", "productivity", "balance"],
        thumbnail: null,
        emptyImage: null,
        platform: "website",
        age: "21+",
    },
    {
        id: 5,
        title: "Building Emotional Resilience in Children",
        type: "video",
        category: "children",
        author: "Child Psychologist Team",
        publishDate: "2024-06-10",
        views: 2890,
        likes: 234,
        status: "live",
        description: "Expert advice on helping children develop emotional resilience and coping skills.",
        tags: ["children", "resilience", "parenting", "emotional-health"],
        thumbnail: null,
        emptyImage: null,
        platform: "both",
        age: "6+",
    },
];

const resourceTypes = [
    {value: "article", label: "Article", icon: FileText},
    {value: "video", label: "Video", icon: Video},
    {value: "tip", label: "Tip", icon: BookOpen},
];

const categories = [
    "stress-management",
    "mindfulness",
    "exam-prep",
    "workplace",
    "children",
    "self-care",
    "relationships",
    "sleep",
];

const platformOptions = [
    {value: "website", label: "Website"},
    {value: "app", label: "App"},
    {value: "both", label: "Both"},
];

const statusOptions = [
    {value: "live", label: "Live"},
    {value: "hide", label: "Hide"},
    {value: "draft", label: "Draft"},
];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// 1. Change form.tags to be an array, add tagInput state
const getInitialForm = () => ({
    title: "",
    author: "",
    type: "",
    category: "",
    description: "",
    tags: [], // now an array
    thumbnail: null,
    emptyImage: null,
    platform: "",
    age: "",
    status: "live",
});

// 2. Update getInitialResources to support both string and array tags
const getTagsArray = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
};

const getInitialResources = () => {
    const stored = localStorage.getItem("resources");
    if (stored) {
        try {
            return JSON.parse(stored).map((r) => ({
                ...r,
                tags: getTagsArray(r.tags),
            }));
        } catch {
            // fallback to mock if corrupted
        }
    }
    return [...mockResources];
};

export const ResourceManager = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState(getInitialResources);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [platformFilter, setPlatformFilter] = useState("all");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [form, setForm] = useState(getInitialForm());
    const [tagInput, setTagInput] = useState("");
    const [thumbPreview, setThumbPreview] = useState(null);
    const [emptyPreview, setEmptyPreview] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [viewingResource, setViewingResource] = useState(null);
    const [errors, setErrors] = useState<ResourceFormErrors>({});
    const fileInputRef = useRef();
    const emptyInputRef = useRef();
    const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({from: null, to: null});
    // Add a state for topCardFilter to control which card is active
    const [topCardFilter, setTopCardFilter] = useState<'all' | 'published' | 'draft'>('all');

    // --- STATS ---
    const draftCount = resources.filter((r) => r.status === "draft").length;
    const liveCount = resources.filter((r) => r.status === "live").length;
    // Image upload for stats area
    const [statsImage, setStatsImage] = useState(null);
    const [statsImagePreview, setStatsImagePreview] = useState(null);
    const statsImageInputRef = useRef();
    const handleStatsImage = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                return;
            }
            if (file.size > 1024 * 1024) {
                return;
            }
            const base64 = await fileToBase64(file);
            setStatsImage(base64);
            setStatsImagePreview(base64);
        }
    };

    // Validation function
    const validateForm = () => {
        const newErrors: ResourceFormErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.author.trim()) newErrors.author = "Author is required";
        if (!form.type) newErrors.type = "Type is required";
        if (!form.category) newErrors.category = "Category is required";
        if (!form.platform) newErrors.platform = "Platform is required";
        if (!form.age.trim()) newErrors.age = "Age is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.tags || form.tags.length === 0) newErrors.tags = "At least one tag is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save to localStorage whenever resources change
    useEffect(() => {
        localStorage.setItem("resources", JSON.stringify(resources));
    }, [resources]);

    // Handler for all input fields, including tagInput
    const handleInput = (e) => {
        const {id, value} = e.target;
        if (id === "tagInput") {
            setTagInput(value);
        } else {
            setForm((f) => ({...f, [id]: value}));
        }
    };

    // Handler for Select fields
    const handleSelect = (field, value) => {
        setForm((f) => ({...f, [field]: value}));
    };

    // Handler for file inputs
    const handleFile = async (field, e) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                setErrors((prev) => ({...prev, [field]: "Only JPG, GIF, or PNG files are allowed."}));
                return;
            }
            if (file.size > 1024 * 1024) {
                setErrors((prev) => ({...prev, [field]: "File size must be 1MB or less."}));
                return;
            }
            setErrors((prev) => ({...prev, [field]: undefined}));
            const base64 = await fileToBase64(file);
            setForm((f) => ({...f, [field]: base64}));
            if (field === "thumbnail") setThumbPreview(base64);
            if (field === "emptyImage") setEmptyPreview(base64);
        }
    };

    // 4. Add handleTagKeyDown
    const handleTagKeyDown = (e) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(tagInput.trim())) {
                setForm((f) => ({...f, tags: [...f.tags, tagInput.trim()]}));
            }
            setTagInput("");
        }
    };

    // 5. Remove tag
    const handleRemoveTag = (tag) => {
        setForm((f) => ({...f, tags: f.tags.filter((t) => t !== tag)}));
    };

    // 6. Update openEditDialog to support array tags
    const openEditDialog = (resource) => {
        setEditingResource(resource);
        setForm({
            title: resource.title,
            author: resource.author,
            type: resource.type,
            category: resource.category,
            description: resource.description,
            tags: getTagsArray(resource.tags),
            thumbnail: resource.thumbnail,
            emptyImage: resource.emptyImage,
            platform: resource.platform,
            age: resource.age,
            status: resource.status,
        });
        setTagInput("");
        setThumbPreview(resource.thumbnail);
        setEmptyPreview(resource.emptyImage);
        setEditDialogOpen(true);
    };

    // Helper for average rate (likes per resource)
    const getAverageRate = () => {
        if (resources.length === 0) return 0;
        return (resources.reduce((sum, r) => sum + (r.likes || 0), 0) / resources.length).toFixed(2);
    };

    // Add handler for Save Draft (Add dialog)
    const handleSaveDraft = () => {
        if (!form.title.trim()) {
            setErrors((prev) => ({...prev, title: "Title is required"}));
            return;
        }
        const newResource = {
            id: Date.now(),
            title: form.title,
            author: form.author,
            type: form.type,
            category: form.category,
            description: form.description,
            tags: form.tags,
            status: form.status, // use selected status
            publishDate: new Date().toISOString(),
            views: 0,
            likes: 0,
            thumbnail: thumbPreview,
            emptyImage: emptyPreview,
            platform: form.platform,
            age: form.age,
        };
        setResources((prev) => [newResource, ...prev]);
        setIsAddDialogOpen(false);
        setForm(getInitialForm());
        setTagInput("");
        setThumbPreview(null);
        setEmptyPreview(null);
        setErrors({});
    };

    // Add handler for Save Draft (Edit dialog)
    const handleEditSaveDraft = () => {
        if (!form.title.trim()) {
            setErrors((prev) => ({...prev, title: "Title is required"}));
            return;
        }
        setResources((prev) =>
            prev.map((r) =>
                r.id === editingResource.id
                    ? {
                        ...r,
                        title: form.title,
                        author: form.author,
                        type: form.type,
                        category: form.category,
                        description: form.description,
                        tags: form.tags,
                        thumbnail: thumbPreview,
                        emptyImage: emptyPreview,
                        platform: form.platform,
                        age: form.age,
                        status: "draft",
                    }
                    : r
            )
        );
        setEditDialogOpen(false);
        setEditingResource(null);
        setForm(getInitialForm());
        setTagInput("");
        setThumbPreview(null);
        setEmptyPreview(null);
        setErrors({});
    };

    // 7. Update handlePublish and handleEditSave to use array tags
    const handlePublish = () => {
        if (!validateForm()) return;
        const newResource = {
            id: Date.now(),
            title: form.title,
            author: form.author,
            type: form.type,
            category: form.category,
            description: form.description,
            tags: form.tags,
            status: form.status, // use selected status
            publishDate: new Date().toISOString(),
            views: 0,
            likes: 0,
            thumbnail: thumbPreview,
            emptyImage: emptyPreview,
            platform: form.platform,
            age: form.age,
        };
        setResources((prev) => [newResource, ...prev]);
        setIsAddDialogOpen(false);
        setForm(getInitialForm());
        setTagInput("");
        setThumbPreview(null);
        setEmptyPreview(null);
        setErrors({});
    };

    const handleDelete = (id) => {
        setResources((prev) => prev.filter((r) => r.id !== id));
    };

    // Update filteredResources logic to use topCardFilter if set
    const filteredResources = resources.filter((resource) => {
        const matchesSearch =
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
        let matchesType = true;
        // Use topCardFilter for status filtering
        if (topCardFilter === 'published') {
            matchesType = resource.status === 'live';
        } else if (topCardFilter === 'draft') {
            matchesType = resource.status === 'draft';
        } else if (typeFilter === 'published') {
            matchesType = resource.status === 'live';
        } else if (typeFilter !== 'all') {
            matchesType = resource.type === typeFilter;
        }
        const matchesCategory =
            categoryFilter === "all" || resource.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
        const matchesPlatform = platformFilter === "all" || resource.platform === platformFilter;
        let matchesDate = true;
        if (dateRange.from && dateRange.to) {
            const d = new Date(resource.publishDate);
            matchesDate = d >= dateRange.from && d <= dateRange.to;
        } else if (dateRange.from) {
            const d = new Date(resource.publishDate);
            matchesDate = d >= dateRange.from;
        } else if (dateRange.to) {
            const d = new Date(resource.publishDate);
            matchesDate = d <= dateRange.to;
        }
        return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPlatform && matchesDate;
    });

    const getTypeIcon = (type: string) => {
        const typeObj = resourceTypes.find((t) => t.value === type);
        const Icon = typeObj?.icon || FileText;
        return <Icon className="h-4 w-4"/>;
    };

    const getTypeColor = (type: string) => {
        const colors = {
            article: "bg-blue-100 text-blue-800",
            video: "bg-purple-100 text-purple-800",
            tip: "bg-green-100 text-green-800",
        };
        return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
    };

    const getStatusColor = (status: string) => {
        return status === "live"
            ? "bg-green-100 text-green-800"
            : status === "hide"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800";
    };

    const totalViews = resources.reduce((sum, resource) => sum + resource.views, 0);
    const totalLikes = resources.reduce((sum, resource) => sum + resource.likes, 0);
    const publishedCount = resources.filter((r) => r.status === "live").length;


    // 7. Update handleEditSave to use array tags
    const handleEditSave = () => {
        if (!validateForm()) return;
        setResources((prev) =>
            prev.map((r) =>
                r.id === editingResource.id
                    ? {
                        ...r,
                        title: form.title,
                        author: form.author,
                        type: form.type,
                        category: form.category,
                        description: form.description,
                        tags: form.tags,
                        thumbnail: thumbPreview,
                        emptyImage: emptyPreview,
                        platform: form.platform,
                        age: form.age,
                        status: form.status,
                    }
                    : r
            )
        );
        setEditDialogOpen(false);
        setEditingResource(null);
        setForm(getInitialForm());
        setTagInput("");
        setThumbPreview(null);
        setEmptyPreview(null);
        setErrors({});
    };


    const openViewDialog = (resource) => {
        setViewingResource(resource);
        setViewDialogOpen(true);
    };


    const tableHeaders = [
        "Thumbnail",
        "Title",
        "Author",
        "Type",
        "Category",
        "Status",
        "Published",
        "Actions",
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119]">
                        Resources
                    </h1>
                    <p className="text-gray-600 mt-2 text-[#012765]">
                        Manage wellness articles, videos, and tips
                    </p>
                </div>
                <Button
                    className="mt-4 md:mt-0 bg-[#012765] text-white"
                    onClick={() => navigate("/resources/new")}
                >
                    <Plus className="h-4 w-4 mr-2"/>
                    Add Resource
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <button
                    className={`border-0 shadow-lg bg-white rounded-lg focus:outline-none transition ring-2 ${topCardFilter === 'all' ? 'ring-[#012765]' : 'ring-transparent'}`}
                    onClick={() => setTopCardFilter('all')}
                    style={{textAlign: 'left'}}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#012765]">Total Resources</p>
                                <p className="text-3xl font-bold text-[#012765]">{resources.length}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-500"/>
                        </div>
                    </CardContent>
                </button>
                <button
                    className={`border-0 shadow-lg bg-white rounded-lg focus:outline-none transition ring-2 ${topCardFilter === 'published' ? 'ring-[#012765]' : 'ring-transparent'}`}
                    onClick={() => setTopCardFilter('published')}
                    style={{textAlign: 'left'}}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#012765]">Published</p>
                                <p className="text-3xl font-bold text-[#012765]">{publishedCount}</p>
                            </div>
                            <FileText className="h-8 w-8 text-green-500"/>
                        </div>
                    </CardContent>
                </button>
                <button
                    className={`border-0 shadow-lg bg-white rounded-lg focus:outline-none transition ring-2 ${topCardFilter === 'draft' ? 'ring-[#012765]' : 'ring-transparent'}`}
                    onClick={() => setTopCardFilter('draft')}
                    style={{textAlign: 'left'}}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#012765]">Draft</p>
                                <p className="text-3xl font-bold text-[#012765]">{draftCount}</p>
                                <p className="text-xs text-gray-500 mt-1">{draftCount} draft(s) saved</p>
                            </div>
                            <FilePen className="h-8 w-8 text-yellow-500"/>
                        </div>
                    </CardContent>
                </button>
                <div className="border-0 shadow-lg bg-white rounded-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#012765]">Rate</p>
                                <p className="text-3xl font-bold text-[#012765]">{getAverageRate()}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500"/>
                        </div>
                    </CardContent>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                            <Input
                                placeholder="Search resources by title, description, or tags..."
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
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category
                                            .replace("-", " ")
                                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Platform filter */}
                        <Select value={platformFilter} onValueChange={setPlatformFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Platform"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Platforms</SelectItem>
                                {platformOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Status filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Add date range filter here */}
                        <div className="w-full md:w-80 flex flex-col justify-center">
                            {/*<label className="text-xs font-medium text-gray-600 mb-1">Published Date Range</label>*/}
                            <div className="flex items-center gap-2">
                                <DateInputButton
                                    value={dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
                                    onChange={(date) => {
                                        const dateObj = date ? new Date(date) : null;
                                        setDateRange(r => ({...r, from: dateObj}));
                                    }}
                                    placeholder="From"
                                    title="Select From Date"
                                    className="flex-1"
                                />
                                <span className="mx-1 text-gray-500">-</span>
                                <DateInputButton
                                    value={dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
                                    onChange={(date) => {
                                        const dateObj = date ? new Date(date) : null;
                                        setDateRange(r => ({...r, to: dateObj}));
                                    }}
                                    placeholder="To"
                                    title="Select To Date"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Insert after the stats cards, before the search/filter card: */}
            <div className="w-full overflow-x-auto mb-4">
                <div className="flex items-center gap-2 md:gap-4 bg-white rounded-lg px-2 py-2 border border-gray-100">
                    {[
                        {label: 'All', value: 'all', color: 'bg-gray-400 text-white', count: resources.length},
                        {
                            label: 'Published',
                            value: 'published',
                            color: 'bg-green-50 text-green-800',
                            count: publishedCount
                        },
                        ...resourceTypes.map(rt => ({
                            label: rt.label,
                            value: rt.value,
                            color: rt.value === 'article' ? 'bg-blue-50 text-blue-800' : rt.value === 'video' ? 'bg-purple-50 text-purple-800' : 'bg-green-50 text-green-800',
                            count: resources.filter(r => r.type === rt.value).length
                        }))
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setTypeFilter(tab.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm transition-colors border border-transparent whitespace-nowrap ${typeFilter === tab.value ? 'bg-[#012765] text-white shadow' : tab.color} hover:bg-[#FF7119] hover:text-white`}
                            style={{minWidth: 80}}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${typeFilter === tab.value ? 'bg-white text-[#012765]' : 'bg-gray-200 text-gray-700'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Resource Listing Table */}
            <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                    {filteredResources.map((resource) => (
                        <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2">
                                {resource.thumbnail ? (
                                    <img
                                        src={resource.thumbnail}
                                        alt="Thumbnail"
                                        className="h-12 w-12 object-cover rounded border border-gray-200"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">No Image</span>
                                )}
                            </td>
                            <td className="px-4 py-2 font-semibold text-[15px] text-gray-900 max-w-xs truncate">{resource.title}</td>
                            <td className="px-4 py-2 text-gray-700 text-[15px]">{resource.author}</td>
                            <td className="px-4 py-2">
                                <Badge
                                    className={getTypeColor(resource.type) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                                    <div className="flex items-center space-x-1">
                                        {getTypeIcon(resource.type)}
                                        <span>{resource.type}</span>
                                    </div>
                                </Badge>
                            </td>
                            <td className="px-4 py-2">
                                <Badge
                                    className="bg-purple-100 text-purple-800 transition-colors duration-150 hover:bg-[#012765] hover:text-white">
                                    {resource.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Badge>
                            </td>
                            <td className="px-4 py-2">
                                <Badge className="bg-gray-100 text-gray-800 hover:bg-[#012765] hover:text-white">
                                    {platformOptions.find((p) => p.value === resource.platform)?.label || resource.platform}
                                </Badge>
                            </td>
                            <td className="px-4 py-2 text-gray-700 text-[15px]">{resource.age}</td>
                            <td className="px-4 py-2">
                                <Badge
                                    className={getStatusColor(resource.status) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                                    {statusOptions.find((s) => s.value === resource.status)?.label || resource.status}
                                </Badge>
                            </td>
                            <td className="px-4 py-2 text-gray-700 text-[15px]">{new Date(resource.publishDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-gray-700 text-[15px]">{resource.views.toLocaleString()}</td>
                            <td className="px-4 py-2 text-gray-700 text-[15px]">{resource.likes}</td>
                            <td className="px-4 py-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-5 w-5 text-gray-500"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuItem
                                            onClick={() => navigate(`/resources/edit/${resource.id}?view=1`)}
                                            className="flex items-center gap-2"
                                        >
                                            <Eye className="h-4 w-4 mr-2 text-gray-600"/>
                                            View Resource
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => navigate(`/resources/edit/${resource.id}`)}
                                            className="flex items-center gap-2"
                                        >
                                            <Edit className="h-4 w-4 mr-2 text-gray-600"/>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(resource.id)}
                                            className="flex items-center gap-2 text-red-600 focus:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2"/>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                    {filteredResources.length === 0 && (
                        <tr>
                            <td colSpan={12} className="text-center py-8 text-gray-400">
                                No resources found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};