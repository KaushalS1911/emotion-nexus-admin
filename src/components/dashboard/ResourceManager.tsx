import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, Heart, BookOpen, Video, FileText, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
    status: "published",
    description: "Learn simple yet effective breathing techniques that can help you manage stress and anxiety in just a few minutes.",
    tags: ["breathing", "stress", "anxiety", "mindfulness"],
    thumbnail: null,
    emptyImage: null,
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
    status: "published",
    description: "A 10-minute guided meditation session perfect for those new to mindfulness practice.",
    tags: ["meditation", "mindfulness", "beginners", "guided"],
    thumbnail: null,
    emptyImage: null,
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
    status: "published",
    description: "Comprehensive strategies to overcome exam anxiety and improve academic performance.",
    tags: ["exams", "anxiety", "students", "performance"],
    thumbnail: null,
    emptyImage: null,
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
    status: "published",
    description: "Expert advice on helping children develop emotional resilience and coping skills.",
    tags: ["children", "resilience", "parenting", "emotional-health"],
    thumbnail: null,
    emptyImage: null,
  },
];

const resourceTypes = [
  { value: "article", label: "Article", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "tip", label: "Tip", icon: BookOpen },
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getInitialForm = () => ({
  title: "",
  author: "",
  type: "",
  category: "",
  description: "",
  tags: "",
  thumbnail: null,
  emptyImage: null,
});

const getInitialResources = () => {
  const stored = localStorage.getItem("resources");
  if (stored) {
    try {
      return JSON.parse(stored).map((r) => ({
        ...r,
        tags: Array.isArray(r.tags)
          ? r.tags
          : typeof r.tags === "string"
            ? r.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
      }));
    } catch {
      // fallback to mock if corrupted
    }
  }
  return [...mockResources];
};

export const ResourceManager = () => {
  const [resources, setResources] = useState(getInitialResources);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState(getInitialForm());
  const [thumbPreview, setThumbPreview] = useState(null);
  const [emptyPreview, setEmptyPreview] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const fileInputRef = useRef();
  const emptyInputRef = useRef();

  // Save to localStorage whenever resources change
  useEffect(() => {
    localStorage.setItem("resources", JSON.stringify(resources));
  }, [resources]);

  const handleInput = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const handleSelect = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFile = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setForm((f) => ({ ...f, [field]: base64 }));
      if (field === "thumbnail") setThumbPreview(base64);
      if (field === "emptyImage") setEmptyPreview(base64);
    }
  };

  const handlePublish = () => {
    const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const newResource = {
      id: Date.now(),
      title: form.title,
      author: form.author,
      type: form.type,
      category: form.category,
      description: form.description,
      tags: tagsArray,
      status: "published",
      publishDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      thumbnail: thumbPreview,
      emptyImage: emptyPreview,
    };
    setResources((prev) => [newResource, ...prev]);
    setIsAddDialogOpen(false);
    setForm(getInitialForm());
    setThumbPreview(null);
    setEmptyPreview(null);
  };

  const handleDelete = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
    const matchesType = typeFilter === "all" || resource.type === typeFilter;
    const matchesCategory =
        categoryFilter === "all" || resource.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter;
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

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
    return status === "published"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800";
  };

  const totalViews = resources.reduce((sum, resource) => sum + resource.views, 0);
  const totalLikes = resources.reduce((sum, resource) => sum + resource.likes, 0);
  const publishedCount = resources.filter((r) => r.status === "published").length;


  const openEditDialog = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      author: resource.author,
      type: resource.type,
      category: resource.category,
      description: resource.description,
      tags: resource.tags.join(", "),
      thumbnail: resource.thumbnail,
      emptyImage: resource.emptyImage,
    });
    setThumbPreview(resource.thumbnail);
    setEmptyPreview(resource.emptyImage);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

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
                  tags: tagsArray,
                  thumbnail: thumbPreview,
                  emptyImage: emptyPreview,
                }
                : r
        )
    );
    setEditDialogOpen(false);
    setEditingResource(null);
    setForm(getInitialForm());
    setThumbPreview(null);
    setEmptyPreview(null);
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
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) {
                setForm(getInitialForm());
                setThumbPreview(null);
                setEmptyPreview(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-[#012765] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={form.title}
                        onChange={handleInput}
                        placeholder="Resource title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                        id="author"
                        value={form.author}
                        onChange={handleInput}
                        placeholder="Author name..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                        value={form.type}
                        onValueChange={(v) => handleSelect("type", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                        value={form.category}
                        onValueChange={(v) => handleSelect("category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category
                                  .replace("-", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile("thumbnail", e)}
                        ref={fileInputRef}
                    />
                    {thumbPreview && (
                        <img
                            src={thumbPreview}
                            alt="Thumbnail Preview"
                            className="mt-2 w-full h-40 object-cover rounded"
                        />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="emptyImage">Image</Label>
                    <Input
                        id="emptyImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile("emptyImage", e)}
                        ref={emptyInputRef}
                    />
                    {emptyPreview && (
                        <img
                            src={emptyPreview}
                            alt="Empty Preview"
                            className="mt-2 w-full h-40 object-cover rounded"
                        />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleInput}
                      placeholder="Resource description..."
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                      id="tags"
                      value={form.tags}
                      onChange={handleInput}
                      placeholder="tag1, tag2, tag3..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(false)}>
                    Save Draft
                  </Button>
                  <Button onClick={handlePublish}>Publish</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#012765]">
                    Total Resources
                  </p>
                  <p className="text-3xl font-bold text-[#012765]">
                    {resources.length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#012765]">Published</p>
                  <p className="text-3xl font-bold text-[#012765]">
                    {publishedCount}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#012765]">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-[#012765]">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#012765]">Total Likes</p>
                  <p className="text-3xl font-bold text-[#012765]">{totalLikes}</p>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search resources by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="tip">Tips</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Edit Resource Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                      id="title"
                      value={form.title}
                      onChange={handleInput}
                      placeholder="Resource title..."
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                      id="author"
                      value={form.author}
                      onChange={handleInput}
                      placeholder="Author name..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                      value={form.type}
                      onValueChange={(v) => handleSelect("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                      value={form.category}
                      onValueChange={(v) => handleSelect("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category
                                .replace("-", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thumbnail">Thumbnail Image</Label>
                  <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile("thumbnail", e)}
                      ref={fileInputRef}
                  />
                  {thumbPreview && (
                      <img
                          src={thumbPreview}
                          alt="Thumbnail Preview"
                          className="mt-2 w-full h-40 object-cover rounded"
                      />
                  )}
                </div>
                <div>
                  <Label htmlFor="emptyImage">Image</Label>
                  <Input
                      id="emptyImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile("emptyImage", e)}
                      ref={emptyInputRef}
                  />
                  {emptyPreview && (
                      <img
                          src={emptyPreview}
                          alt="Empty Preview"
                          className="mt-2 w-full h-40 object-cover rounded"
                      />
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Resource description..."
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                    id="tags"
                    value={form.tags}
                    onChange={handleInput}
                    placeholder="tag1, tag2, tag3..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Resource Details</DialogTitle>
            </DialogHeader>
            {viewingResource && (
                <div className="space-y-8">
                  {(viewingResource.thumbnail || viewingResource.emptyImage) && (
                      <div>
                        <div className="font-semibold text-lg text-gray-800 mb-2">
                          Images
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                          {viewingResource.thumbnail && (
                              <div className="flex-1 flex flex-col items-center bg-gray-50 border border-gray-100 rounded-lg p-3 shadow-sm">
                                <img
                                    src={viewingResource.thumbnail}
                                    alt="Thumbnail"
                                    className="max-h-48 max-w-full object-contain rounded shadow"
                                />
                                <span className="mt-2 text-xs text-gray-500">
                          Thumbnail
                        </span>
                              </div>
                          )}
                          {viewingResource.emptyImage && (
                              <div className="flex-1 flex flex-col items-center bg-gray-50 border border-gray-100 rounded-lg p-3 shadow-sm">
                                <img
                                    src={viewingResource.emptyImage}
                                    alt="Empty"
                                    className="max-h-48 max-w-full object-contain rounded shadow"
                                />
                                <span className="mt-2 text-xs text-gray-500">
                          Image
                        </span>
                              </div>
                          )}
                        </div>
                      </div>
                  )}
                  <hr className="my-2 border-gray-200" />
                  <div>
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      Basic Info
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      <div>
                        <span className="font-semibold text-gray-600">Title:</span>{" "}
                        <span className="text-gray-900">{viewingResource.title}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Author:</span>{" "}
                        <span className="text-gray-900">{viewingResource.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600">Type:</span>
                        <Badge className={getTypeColor(viewingResource.type) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                          {viewingResource.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600">Category:</span>
                        <Badge className="bg-purple-100 text-purple-800 transition-colors duration-150 hover:bg-[#012765] hover:text-white">
                          {viewingResource.category
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-600">Status:</span>
                        <Badge className={getStatusColor(viewingResource.status) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                          {viewingResource.status}
                        </Badge>
                      </div>
                      <div className="md:col-span-2">
                    <span className="font-semibold text-gray-600">
                      Description:
                    </span>{" "}
                        <span className="text-gray-900">
                      {viewingResource.description}
                    </span>
                      </div>
                      <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
                        <span className="font-semibold text-gray-600">Tags:</span>
                        {viewingResource.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                        {tag}
                      </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <hr className="my-2 border-gray-200" />
                  <div>
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      Meta
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-600">
                      Publish Date:
                    </span>
                        <span className="text-gray-900">
                      {new Date(viewingResource.publishDate).toLocaleDateString()}
                    </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" aria-label="Views" />
                        <span className="font-semibold text-gray-600">Views:</span>
                        <span className="text-gray-900">{viewingResource.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart
                            className="h-4 w-4 text-pink-500"
                            aria-label="Likes"
                        />
                        <span className="font-semibold text-gray-600">Likes:</span>
                        <span className="text-gray-900">{viewingResource.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Resource Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
              <Card
                  key={resource.id}
                  className="border-0 shadow-xl hover:shadow-2xl transition-shadow rounded-xl bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(resource.type) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(resource.type)}
                          <span>{resource.type}</span>
                        </div>
                      </Badge>
                      <Badge className={getStatusColor(resource.status) + " transition-colors duration-150 hover:bg-[#012765] hover:text-white"}>
                        {resource.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(resource)}
                          title="Edit"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(resource.id)}
                          title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {resource.thumbnail && (
                      <div
                          className="mb-4 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 p-2"
                          style={{ minHeight: 160, maxHeight: 220 }}
                      >
                        <img
                            src={resource.thumbnail}
                            alt="Thumbnail"
                            className="max-h-48 max-w-full object-contain rounded"
                        />
                      </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                        >
                    {tag}
                  </span>
                    ))}
                    {resource.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">
                    +{resource.tags.length - 3} more
                  </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>By {resource.author}</span>
                    <span>{new Date(resource.publishDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{resource.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{resource.likes}</span>
                      </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(resource)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold rounded"
                        title="View Details"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  );
};