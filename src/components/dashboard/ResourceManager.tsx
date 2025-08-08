import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    TrendingUp,
    FilePen,
    RefreshCw,
    ChevronLeft,
    ChevronRight, Calendar, Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DateInputButton } from "@/components/ui/DatePickerDialog";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {useArticleCategories} from "@/hooks/useArticleCategories.tsx";
import {toast} from "sonner";

// Types and constants
type ResourceFormErrors = {
  title?: string;
  counsellor_code?: string;
  type?: string;
  category_name?: string;
  platform?: string;
  age?: string;
  description?: string;
  tags?: string;
  image?: string;
  emptyImage?: string;
};

type Resource = {
  id: number;
  title: string;
  type: string;
  category_name: string;
  counsellor_code: string;
  publishDate: string;
  views: number;
  likes: number;
  status: string;
  description: string;
  tags: string[];
  image: string | null;
  emptyImage: string | null;
  platform: string;
  age: string;
};

const mockResources = [
  // Mock resources array - remained the same
];

const resourceTypes = [
  { value: "article", label: "Article", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "tip", label: "Tip", icon: BookOpen },
];

const platformOptions = [
  { value: "web", label: "Website" },
  { value: "app", label: "App" },
  { value: "both", label: "Both" },
];

const statusOptions = [
  { value: "live", label: "Live" },
  { value: "hide", label: "Hide" },
  { value: "draft", label: "Draft" },
];

// Helper functions
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
  counsellor_code: "",
  type: "",
  category_name: "",
  description: "",
  tags: [] as string[],
  image: null,
  emptyImage: null,
  platform: "",
  age: "",
  status: "live",
});

// 2. Update getInitialResources to support both string and array tags
const getTagsArray = (tags: any): string[] => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

const getInitialResources = (): Resource[] => {
  const stored = localStorage.getItem("resources");
  if (stored) {
    try {
      return JSON.parse(stored).map((r: any) => ({
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
  
  // State management
  const [resources, setResources] = useState<Resource[]>(getInitialResources);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });
  const [topCardFilter, setTopCardFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [approveModel, setApproveModel] = useState({open:false,id:null});

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState(getInitialForm());
  const [tagInput, setTagInput] = useState("");
  const [thumbPreview, setThumbPreview] = useState(null);
  const [emptyPreview, setEmptyPreview] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [errors, setErrors] = useState<ResourceFormErrors>({});
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emptyInputRef = useRef<HTMLInputElement>(null);
  const statsImageInputRef = useRef<HTMLInputElement>(null);
  
  // API states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Stats states
  const [statsImage, setStatsImage] = useState(null);
  const [statsImagePreview, setStatsImagePreview] = useState(null);

  // Stats calculations
  const draftCount = resources.filter((r) => r.status === "draft").length;
  const liveCount = resources.filter((r) => r.status === "live").length;
  const totalViews = resources.reduce((sum, resource) => sum + resource.views, 0);
  const totalLikes = resources.reduce((sum, resource) => sum + resource.likes, 0);
  const publishedCount = resources.filter((r) => r.status === "live").length;

  const { categories, categoriesLoading, categoriesError } = useArticleCategories();

  // Fetch resources from API
    // API function to fetch articles
  const fetchArticles = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('https://interactapiverse.com/mahadevasth/articles/platform/app');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Debug: Log the structure of the response
      console.log('API Response structure:', typeof data, data);

      // Check if data is an array, if not, try to extract articles from the response
      let articles = data;
      if (!Array.isArray(data)) {
        // Try different possible structures
        if (data.articles && Array.isArray(data.articles)) {
          articles = data.articles;
        } else if (data.data && Array.isArray(data.data)) {
          articles = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          articles = data.results;
        } else {
          // If it's a single object, wrap it in an array
          articles = [data];
        }
      }

      // Ensure articles is an array
      if (!Array.isArray(articles)) {
        throw new Error('Invalid data structure received from API');
      }

      // Transform API data to match our resource format
      const transformedResources = articles.map((article: any, index: number) => {
        // --- Robust image key handling ---
        let imageUrl = article.image;
        // If image is a JSON string (e.g., '["url"]'), parse it
        if (typeof imageUrl === 'string' && imageUrl.trim().startsWith('[')) {
          try {
            const arr = JSON.parse(imageUrl);
            if (Array.isArray(arr)) imageUrl = arr[0] || null;
          } catch {}
        }
        // If image is an array
        if (Array.isArray(imageUrl)) {
          imageUrl = imageUrl[0] || null;
        }
        // If image is an object
        if (typeof imageUrl === 'object' && imageUrl !== null) {
          imageUrl = imageUrl.url || null;
        }
        // --- Robust tags handling ---
        let tags = article.tags;
        if (typeof tags === 'string' && tags.trim().startsWith('[')) {
          try {
            tags = JSON.parse(tags);
          } catch {}
        }
        if (!Array.isArray(tags)) {
          tags = tags ? [tags] : [];
        }
        return {
          id: article.id || Date.now() + index,
          admin_approval: article.admin_approval ||'',
          title: article.title || article.name || `Article ${index + 1}`,
          type: 'article',
          category_name: article.category_name || 'general',
          counsellor_code: article.counsellor_code || article.created_by || 'Unknown Author',
          publishDate: article.publish_date || article.created_at || new Date().toISOString(),
          views: article.views || article.view_count || 0,
          likes: article.likes || article.like_count || 0,
          status: 'live',
          description: article.description || article.content || article.article || 'No description available',
          tags,
          image: imageUrl,
          emptyImage: null,
          platform: 'website',
          age: '18+',
        };
      });

      setResources(transformedResources);
      // Reset to first page when new data is fetched
      setPage(0);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to fetch articles');
      // Keep existing resources if API fails
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch resources on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  // Save to localStorage whenever resources change
  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
  }, [resources]);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, typeFilter, categoryFilter, statusFilter, platformFilter, dateRange, topCardFilter, rowsPerPage]);

  // Filter resources based on current filters
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
    
    const matchesCategory = categoryFilter === "all" || resource.category_name === categoryFilter;
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

  // Apply pagination
  const totalPages = Math.ceil(filteredResources.length / rowsPerPage);
  const paginatedResources = filteredResources.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Form validation
    // Handler for all input fields, including tagInput
  const validateForm = () => {
    const newErrors: ResourceFormErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.counsellor_code.trim()) newErrors.counsellor_code = "Author is required";
    if (!form.type) newErrors.type = "Type is required";
    if (!form.category_name) newErrors.category_name = "Category is required";
    if (!form.platform) newErrors.platform = "Platform is required";
    if (!form.age.trim()) newErrors.age = "Age is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.tags || form.tags.length === 0) newErrors.tags = "At least one tag is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function for average rate (likes per resource)
  const getAverageRate = () => {
    if (resources.length === 0) return 0;
    return (resources.reduce((sum, r) => sum + (r.likes || 0), 0) / resources.length).toFixed(2);
  };

  // Event handlers
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "tagInput") {
      setTagInput(value);
    } else {
      setForm((f) => ({ ...f, [id]: value }));
    }
  };

    // Handler for Select fields
  const handleSelect = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

    // Handler for file inputs
  const handleFile = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, [field]: "Only JPG, GIF, or PNG files are allowed." }));
        return;
      }
      if (file.size > 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [field]: "File size must be 1MB or less." }));
        return;
      }
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, [field]: base64 }));
      if (field === "image") setThumbPreview(base64);
      if (field === "emptyImage") setEmptyPreview(base64);
    }
  };

  const handleStatsImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 4. Add handleTagKeyDown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

    // 5. Remove tag
  const handleRemoveTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

    // 6. Update openEditDialog to support array tags
  const handlePublish = () => {
    if (!validateForm()) return;
    const newResource = {
      id: Date.now(),
      title: form.title,
      counsellor_code: form.counsellor_code,
      type: form.type,
      category_name: form.category_name,
      description: form.description,
      tags: form.tags,
      status: form.status,
      publishDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      image: thumbPreview,
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

    // Add handler for Save Draft (Add dialog)
  const handleSaveDraft = () => {
    if (!form.title.trim()) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      return;
    }
    const newResource = {
      id: Date.now(),
      title: form.title,
      counsellor_code: form.counsellor_code,
      type: form.type,
      category_name: form.category_name,
      description: form.description,
      tags: form.tags,
      status: "draft",
      publishDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      image: thumbPreview,
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
  const handleEditSave = () => {
    if (!validateForm() || !editingResource) return;
    setResources((prev) =>
      prev.map((r) =>
        r.id === editingResource.id
          ? {
              ...r,
              title: form.title,
              counsellor_code: form.counsellor_code,
              type: form.type,
              category_name: form.category_name,
              description: form.description,
              tags: form.tags,
              image: thumbPreview,
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

    // 7. Update handlePublish and handleEditSave to use array tags
  const handleEditSaveDraft = () => {
    if (!form.title.trim() || !editingResource) {
      setErrors((prev) => ({ ...prev, title: "Title is required" }));
      return;
    }
    setResources((prev) =>
      prev.map((r) =>
        r.id === editingResource.id
          ? {
              ...r,
              title: form.title,
              counsellor_code: form.counsellor_code,
              type: form.type,
              category_name: form.category_name,
              description: form.description,
              tags: form.tags,
              image: thumbPreview,
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

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      counsellor_code: resource.counsellor_code,
      type: resource.type,
      category_name: resource.category_name,
      description: resource.description,
      tags: getTagsArray(resource.tags),
      image: resource.image,
      emptyImage: resource.emptyImage,
      platform: resource.platform,
      age: resource.age,
      status: resource.status,
    });
    setTagInput("");
    setThumbPreview(resource.image);
    setEmptyPreview(resource.emptyImage);
    setEditDialogOpen(true);
  };

  const openViewDialog = (resource: Resource) => {
    setViewingResource(resource);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  // UI helper functions
  const getTypeIcon = (type: string) => {
    const typeObj = resourceTypes.find((t) => t.value === type);
    const Icon = typeObj?.icon || FileText;
    return <Icon className="h-4 w-4" />;
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

  const handleSubmitArticle = async () => {
      try {
          const response = await fetch(`https://interactapiverse.com/mahadevasth/shape/article/${approveModel.id}/approval`, {
              method: "PATCH",
              headers: {
                  "Content-Type": "application/json",
              }
          });

          if (!response.ok) {
              throw new Error("Failed to approve article");
          }
          setApproveModel({open:false,id:null})
          toast({
              title: "Article approved!",
              description: "The article has been successfully approved.",
          });


      } catch (error: any) {
          setApproveModel({open:false,id:null})
          toast({
              title: error.message || "An error occurred while approving the article.",
              variant: "destructive",
          });
      }
  }

  return (
    <div className="space-y-6">
        <Dialog open={approveModel?.open} onOpenChange={()=>setApproveModel({open:false,id:null})}>
            <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden p-3 pt-4">
                <div>Are you sure you want to approve this article?</div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                                setApproveModel({open:false,id:null});
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#FF7119] text-white font-semibold hover:bg-[#d95e00] transition-colors"
                            onClick={handleSubmitArticle}
                        >
                            Ok
                        </Button>
                    </div>
            </DialogContent>
        </Dialog>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#FF7119]">
            Resources
          </h1>
          <p className="text-gray-600 mt-2 text-[#012765]">
            Manage wellness articles, videos, and tips
          </p>
          {apiError && (
            <p className="text-red-600 mt-1 text-sm">
              API Error: {apiError}
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            className="bg-[#012765] text-white"
            onClick={() => navigate("/resources/new")}
          >
            <Plus className="h-4 w-4 mr-2"/>
            Add Resource
          </Button>
        </div>
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

      {/* Filters Card */}
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
                  <SelectItem key={category.id} value={category.category}>
                    {category.category}
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
            {/* Date range filter */}
            <div className="w-full md:w-80 flex flex-col justify-center">
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

      {/* Type Filter Chips */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              typeFilter === 'all'
                ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500 ring-offset-2'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            All Types ({resources.length})
          </button>
          {resourceTypes.map((type) => {
            const count = resources.filter(r => r.type === type.value).length;
            const Icon = type.icon;
            const colors = {
              article: {
                active: 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-500 ring-offset-2',
                default: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              },
              video: {
                active: 'bg-purple-100 text-purple-800 ring-2 ring-purple-500 ring-offset-2',
                default: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              },
              tip: {
                active: 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500 ring-offset-2',
                default: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            };
            const typeColor = colors[type.value as keyof typeof colors];

            return (
              <button
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  typeFilter === type.value
                    ? typeColor.active
                    : typeColor.default
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {type.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Thumbnail</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Author</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Published</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResources.length > 0 ? (
                  paginatedResources.map((resource) => (
                    <tr key={resource.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                          {resource.image ? (
                            <img src={resource.image} alt={resource.title} className="h-full w-full object-cover" />
                          ) : (
                            getTypeIcon(resource.type)
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 max-w-[200px]">
                        <div className="truncate font-medium">{resource.title}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {resource.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="mr-1">#{tag}</span>
                          ))}
                          {resource.tags.length > 2 && <span>+{resource.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="py-2 px-4">{resource.counsellor_code}</td>
                      <td className="py-2 px-4">
                        <Badge className={`${getTypeColor(resource.type)} flex items-center gap-1 font-normal`}>
                          {getTypeIcon(resource.type)}
                          <span>{resource.type}</span>
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        {resource.category_name
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </td>
                      <td className="py-2 px-4">
                        <Badge className={getStatusColor(resource.status)}>
                          {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        {resource.publishDate
                          ? format(new Date(resource.publishDate), "MMM dd, yyyy")
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                disabled={resource?.admin_approval === "approved"}
                                onClick={() => setApproveModel({open:true,id:resource.id})}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Approve Article
                            </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/resources/edit/${resource.id}`)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(resource)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Resource
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(resource.id)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-[#012765] mb-2" />
                          <span>Loading resources...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileText className="h-6 w-6 text-gray-400 mb-2" />
                          <span>No resources found matching your filters</span>
                          <Button 
                            variant="link" 
                            className="mt-2 text-[#012765]"
                            onClick={() => {
                              setSearchTerm("");
                              setCategoryFilter("all");
                              setPlatformFilter("all");
                              setStatusFilter("all");
                              setTopCardFilter("all");
                              setDateRange({ from: null, to: null });
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select 
                value={String(rowsPerPage)} 
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder={rowsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {filteredResources.length > 0 ? 
                  `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredResources.length)} of ${filteredResources.length}` : 
                  '0 of 0'}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {viewingResource && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{viewingResource.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {viewingResource.image ? (
                        <img
                          src={viewingResource.image}
                          alt={viewingResource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {getTypeIcon(viewingResource.type)}
                          <span className="ml-2 text-gray-500">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <span>{viewingResource.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-gray-500" />
                        <span>{viewingResource.likes} likes</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Author</h3>
                      <p>{viewingResource.counsellor_code}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Type</h3>
                      <Badge className={`${getTypeColor(viewingResource.type)} mt-1 flex items-center gap-1 font-normal`}>
                        {getTypeIcon(viewingResource.type)}
                        <span>{viewingResource.type}</span>
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p>
                        {viewingResource.category_name
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <Badge className={getStatusColor(viewingResource.status)}>
                        {viewingResource.status.charAt(0).toUpperCase() + viewingResource.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Published Date</h3>
                      <p>
                        {viewingResource.publishDate
                          ? format(new Date(viewingResource.publishDate), "MMMM dd, yyyy")
                          : "Not published"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Platform</h3>
                      <p>{viewingResource.platform}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age Group</h3>
                      <p>{viewingResource.age}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1">{viewingResource.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingResource.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Other dialogs would go here (Add/Edit dialogs, etc.) */}
    </div>
  );
};
