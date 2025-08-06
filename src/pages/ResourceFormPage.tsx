import React, {useState, useEffect, useRef} from "react";
import {useNavigate, useParams, useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {ArrowLeft, X} from "lucide-react";
import {Card} from "@/components/ui/card.tsx";
import axios from "axios";

// --- Types and helpers (from ResourceManager) ---
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

const getInitialForm = () => ({
    title: "",
    author: "",
    type: "",
    category: "",
    description: "",
    tags: [],
    thumbnail: null,
    emptyImage: null,
    platform: "",
    age: "",
    status: "live",
});

const getTagsArray = (tags: any) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
};

const resourceTypes = [
    {value: "article", label: "Article"},
    {value: "video", label: "Video"},
    {value: "tip", label: "Tip"},
];
const categories = [
    "stress-management",
    "mindfulness",
    "exam-prep",
    "self-esteem",
    "relationships",
    "productivity",
    "mental-health",
];
const platforms = [
    {value: "website", label: "Website"},
    {value: "app", label: "App"},
    {value: "both", label: "Both"},
];
const ages = ["13+", "16+", "18+"];
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

export default function ResourceFormPage() {
    const navigate = useNavigate();
    const {id} = useParams();
    const location = useLocation();
    const isEdit = Boolean(id);
    const isView = new URLSearchParams(location.search).get('view') === '1';
    const [form, setForm] = useState(getInitialForm());
    const [tagInput, setTagInput] = useState("");
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [emptyPreview, setEmptyPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<ResourceFormErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emptyInputRef = useRef<HTMLInputElement>(null);

    // API states
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);

    // Load resource for edit
    useEffect(() => {
        if (isEdit) {
            const stored = localStorage.getItem("resources");
            const resources = stored ? JSON.parse(stored) : [];
            const found = resources.find((r: any) => String(r.id) === String(id));
            if (found) {
                setForm({...found, tags: getTagsArray(found.tags)});
                setThumbPreview(found.thumbnail || null);
                setEmptyPreview(found.emptyImage || null);
            }
        } else {
            setForm(getInitialForm());
            setThumbPreview(null);
            setEmptyPreview(null);
        }
    }, [id, isEdit]);

    // --- Form Handlers ---
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({...f, [e.target.id]: e.target.value}));
    };
    const handleSelect = (field: string, value: string) => {
        setForm((f) => ({...f, [field]: value}));
    };
    const handleFile = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) return;
            const base64 = await fileToBase64(file);
            if (field === "thumbnail") setThumbPreview(base64);
            if (field === "emptyImage") setEmptyPreview(base64);
            setForm((f) => ({...f, [field]: base64}));
        }
    };
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(tagInput.trim())) {
                setForm((f) => ({...f, tags: [...f.tags, tagInput.trim()]}));
            }
            setTagInput("");
        }
    };
    const handleRemoveTag = (tag: string) => {
        setForm((f) => ({...f, tags: f.tags.filter((t: string) => t !== tag)}));
    };

    // Add image remove handlers
    const handleRemoveImage = (field: 'thumbnail' | 'emptyImage') => {
        if (field === 'thumbnail') {
            setThumbPreview(null);
            setForm(f => ({...f, thumbnail: null}));
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setEmptyPreview(null);
            setForm(f => ({...f, emptyImage: null}));
            if (emptyInputRef.current) emptyInputRef.current.value = '';
        }
    };

    // --- Validation ---
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

    // API function to create article
    const createArticleAPI = async (formData: any) => {
        console.log("hiii")
        setIsLoading(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            // const payload = {
            //     title: formData.title || "Mindful Journaling",
            //     description: formData.description || "Using journals to reflect and grow emotionally.",
            //     author: formData.author || "Dr. Meena",
            //     image: formData.thumbnail || "https://example.com/img.jpg",
            //     type: "Article",
            //     category: formData.category || "Reflection",
            //     platform: formData.platform || "App",
            //     audience_age: formData.age || "13+",
            //     status: "Published",
            //     tags: formData.tags || ["journaling", "mental health"],
            //     resource_status: "Live",
            //     admin_approval: "approved"
            // };

            const payload = {
                title: "Mindful Journaling",
                description: "Using journals to reflect and grow emotionally.",
                author: "Dr. Meena",
                image: "https://example.com/img.jpg",
                type: "Article",
                category: "Reflection",
                platform: "App",
                audience_age: "13+",
                status: "Published",
                tags: [
                    "journaling",
                    "mental health"
                ],
                resource_status: "Live",
                admin_approval: "approved"
            }
            console.log(payload);

            const response = await axios.post('https://www.interactapiverse.com/mahadevasth/shape/article', payload, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log(response);

            const createdArticle = response.data;
            console.log('Created article response:', createdArticle);

            setApiSuccess('Article created successfully via API!');
            setTimeout(() => setApiSuccess(null), 3000);

            return createdArticle;
        } catch (error) {
            console.error('Error creating article:', error);
            if (axios.isAxiosError(error)) {
                setApiError(`HTTP ${error.response?.status}: ${error.response?.data?.message || error.message}`);
            } else {
                setApiError(error instanceof Error ? error.message : 'Failed to create article via API');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // --- Save ---
    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            // First, try to create via API if it's a new resource
            if (!isEdit) {
                await createArticleAPI(form);
            }

            // Then save to localStorage as before
            const stored = localStorage.getItem("resources");
            let resources = stored ? JSON.parse(stored) : [];
            if (isEdit) {
                resources = resources.map((r: any) =>
                    String(r.id) === String(id)
                        ? {...r, ...form, tags: form.tags, thumbnail: thumbPreview, emptyImage: emptyPreview}
                        : r
                );
            } else {
                const newResource = {
                    ...form,
                    id: Date.now(),
                    tags: form.tags,
                    thumbnail: thumbPreview,
                    emptyImage: emptyPreview,
                    publishDate: new Date().toISOString().slice(0, 10),
                    views: 0,
                    likes: 0,
                };
                resources = [newResource, ...resources];
            }
            localStorage.setItem("resources", JSON.stringify(resources));
            navigate("/resources");
        } catch (error) {
            // If API fails, still save to localStorage but show error
            console.error('Error in handleSave:', error);
            const stored = localStorage.getItem("resources");
            let resources = stored ? JSON.parse(stored) : [];
            if (!isEdit) {
                const newResource = {
                    ...form,
                    id: Date.now(),
                    tags: form.tags,
                    thumbnail: thumbPreview,
                    emptyImage: emptyPreview,
                    publishDate: new Date().toISOString().slice(0, 10),
                    views: 0,
                    likes: 0,
                };
                resources = [newResource, ...resources];
            }
            localStorage.setItem("resources", JSON.stringify(resources));
            navigate("/resources");
        }
    };

    // --- Save Draft ---
    const handleSaveDraft = () => {
        if (!validateForm()) return;
        const stored = localStorage.getItem("resources");
        let resources = stored ? JSON.parse(stored) : [];
        if (isEdit) {
            resources = resources.map((r: any) =>
                String(r.id) === String(id)
                    ? {
                        ...r, ...form,
                        status: "draft",
                        tags: form.tags,
                        thumbnail: thumbPreview,
                        emptyImage: emptyPreview
                    }
                    : r
            );
        } else {
            const newResource = {
                ...form,
                id: Date.now(),
                tags: form.tags,
                thumbnail: thumbPreview,
                emptyImage: emptyPreview,
                publishDate: new Date().toISOString().slice(0, 10),
                views: 0,
                likes: 0,
                status: "draft",
            };
            resources = [newResource, ...resources];
        }
        localStorage.setItem("resources", JSON.stringify(resources));
        navigate("/resources");
    };

    return (
        <>
            <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className=" h-4 w-4"/>
                Back
            </Button>
            <form
                style={{maxWidth: "100vw"}}
                onSubmit={async e => {
                    e.preventDefault();
                    if (!isView) await handleSave();
                }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119] mb-2  text-center md:text-left">
                        {isView ? "Resource Details" : isEdit ? "Edit Resource" : "Add New Resource"}
                    </h1>
                    <p className="text-gray-600 mb-5 text-center md:text-left">
                        {isView
                            ? "View all details for this resource."
                            : isEdit
                                ? "Update the details of this resource."
                                : "Fill in the details to add a new resource."}
                    </p>
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>API Error:</strong> {apiError}
                        </div>
                    )}
                    {apiSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                            <strong>Success:</strong> {apiSuccess}
                        </div>
                    )}
                    <Card className="p-6">
                        <div className="flex flex-col gap-4">

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Title</Label>
                                    {isView ? (
                                        <div
                                            className="py-2 px-3 bg-gray-50 rounded border text-gray-800">{form.title}</div>
                                    ) : (
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={handleInput}
                                            placeholder="Resource title..."
                                            className={errors && errors.title ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {errors && errors.title && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.title}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Author</Label>
                                    {isView ? (
                                        <div
                                            className="py-2 px-3 bg-gray-50 rounded border text-gray-800">{form.author}</div>
                                    ) : (
                                        <Input
                                            id="author"
                                            value={form.author}
                                            onChange={handleInput}
                                            placeholder="Author name..."
                                            className={errors && errors.author ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {errors && errors.author && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.author}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Thumbnail Image</Label>
                                    {thumbPreview ? (
                                        <div className="relative mt-2 w-full max-w-xs">
                                            <img
                                                src={thumbPreview}
                                                alt="Thumbnail Preview"
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            {!isView && (
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 border border-gray-300"
                                                    onClick={() => handleRemoveImage('thumbnail')}
                                                    aria-label="Remove thumbnail"
                                                >
                                                    <X className="w-4 h-4 text-gray-700"/>
                                                </button>
                                            )}
                                        </div>
                                    ) : isView ? (
                                        <div className="py-2 px-3 text-gray-400">No image</div>
                                    ) : (
                                        <>
                                            <Input
                                                id="thumbnail"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFile("thumbnail", e)}
                                                ref={fileInputRef}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</div>
                                        </>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Empty State Image</Label>
                                    {emptyPreview ? (
                                        <div className="relative mt-2 w-full max-w-xs">
                                            <img
                                                src={emptyPreview}
                                                alt="Empty State Preview"
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            {!isView && (
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 border border-gray-300"
                                                    onClick={() => handleRemoveImage('emptyImage')}
                                                    aria-label="Remove empty state image"
                                                >
                                                    <X className="w-4 h-4 text-gray-700"/>
                                                </button>
                                            )}
                                        </div>
                                    ) : isView ? (
                                        <div className="py-2 px-3 text-gray-400">No image</div>
                                    ) : (
                                        <>
                                            <Input
                                                id="emptyImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFile("emptyImage", e)}
                                                ref={emptyInputRef}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Type</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {resourceTypes.find(t => t.value === form.type)?.label || form.type}
                                        </div>
                                    ) : (
                                        <Select value={form.type} onValueChange={(v) => handleSelect("type", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {resourceTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors && errors.type && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.type}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Category</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {categories.find(c => c === form.category)?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || form.category}
                                        </div>
                                    ) : (
                                        <Select value={form.category}
                                                onValueChange={(v) => handleSelect("category", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors && errors.category && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.category}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Platform</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {platforms.find(p => p.value === form.platform)?.label || form.platform}
                                        </div>
                                    ) : (
                                        <Select value={form.platform}
                                                onValueChange={(v) => handleSelect("platform", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select platform"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {platforms.map((platform) => (
                                                    <SelectItem key={platform.value} value={platform.value}>
                                                        {platform.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors && errors.platform && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.platform}</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Age</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {form.age}
                                        </div>
                                    ) : (
                                        <Select value={form.age} onValueChange={(v) => handleSelect("age", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select age"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ages.map((age) => (
                                                    <SelectItem key={age} value={age}>{age}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors && errors.age && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.age}</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label>Status</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {statusOptions.find(s => s.value === form.status)?.label || form.status}
                                        </div>
                                    ) : (
                                        <Select value={form.status} onValueChange={(v) => handleSelect("status", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem key={opt.value}
                                                                value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label>Description</Label>
                                {isView ? (
                                    <div
                                        className="py-2 px-3 bg-gray-50 rounded border text-gray-800 min-h-[48px]">{form.description}</div>
                                ) : (
                                    <Textarea
                                        id="description"
                                        value={form.description}
                                        onChange={handleInput}
                                        placeholder="Resource description..."
                                        className={errors && errors.description ? 'border-red-500' : ''}
                                    />
                                )}
                                {errors && errors.description && !isView && (
                                    <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                                )}
                            </div>

                            <div>
                                <Label>Tags</Label>
                                {isView ? (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {form.tags && form.tags.length > 0 ? form.tags.map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="bg-[#FF7119] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                            >
                                            {tag}
                                        </span>
                                        )) : <span className="text-gray-400">No tags</span>}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {form.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="bg-[#FF7119] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                                >
                                                {tag}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-white hover:text-gray-200"
                                                        onClick={() => handleRemoveTag(tag)}
                                                    >
                                                    ×
                                                </button>
                                            </span>
                                            ))}
                                        </div>
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            placeholder="Type a tag and press Enter"
                                            className={errors && errors.tags ? 'border-red-500' : ''}
                                        />
                                        {errors && errors.tags && (
                                            <div className="text-red-500 text-xs mt-1">{errors.tags}</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        {!isView && (
                            <div className="flex flex-col md:flex-row gap-2 mt-10 mb-2 md:mb-0 justify-end w-full">

                                {!isEdit && !isView && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="w-full md:w-auto"
                                        onClick={handleSaveDraft}
                                    >
                                        Save Draft
                                    </Button>
                                )}


                                {!isView && (
                                    <Button
                                        type="submit"
                                        className="w-full md:w-auto bg-[#012765] text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Creating..." : (isEdit ? "Save Changes" : "Add Resource")}
                                    </Button>
                                )}
                            </div>

                        )}
                    </Card>
                </div>
            </form>
        </>
    );
}