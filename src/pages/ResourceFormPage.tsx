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
import {useArticleCategories} from "@/hooks/useArticleCategories.tsx";

type ResourceFormErrors = {
    title?: string;
    author?: string;
    type?: string;
    category_name?: string;
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
    category_name: "",
    description: "",
    tags: [],
    thumbnail: null,
    emptyImage: null,
    platform: "",
    age: "",
    status: "published",
    resource_status: "live",
    admin_approval: "approved",
});

const getTagsArray = (tags: any) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return [];
};

const platforms = [
    {value: "Web", label: "Web"},
    {value: "App", label: "App"},
    {value: "Both", label: "Both"},
];

const ages = ["13+", "14+", "16+", "18+"];

const resourceStatusOptions = [
    {value: "Live", label: "Live"},
    {value: "Hide", label: "Hide"},
    {value: "Draft", label: "Draft"},
];

const statusOptions = [
    {value: "published", label: "Published"},
    {value: "Unpublished", label: "Unpublished"},
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
    const isView = new URLSearchParams(location.search).get('view') === '1';
    const [form, setForm] = useState(getInitialForm());
    const [tagInput, setTagInput] = useState("");
    const [emptyPreview, setEmptyPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<ResourceFormErrors>({});
    const emptyInputRef = useRef<HTMLInputElement>(null);

    // API states
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiSuccess, setApiSuccess] = useState<string | null>(null);

    // Categories states
    const { categories, categoriesLoading, categoriesError } = useArticleCategories();

    // Counsellors state
    const [counsellors, setCounsellors] = useState<{ full_name: string; user_id: number }[]>([]);
    const [counsellorsLoading, setCounsellorsLoading] = useState(false);
    const [counsellorsError, setCounsellorsError] = useState<string | null>(null);

    // Load resource for edit/view
    useEffect(() => {
        const fetchResource = async () => {
            if (!id) return;

            setIsLoading(true);
            setApiError(null);
            try {
                const response = await axios.get(`https://interactapiverse.com/mahadevasth/shape/articles/${id}`);
                const data = response.data?.data?.[0] || response.data;
                setForm({
                    title: data.title || "",
                    author: data.counsellor_name || data.author || "",
                    type: data.type || "",
                    category_name: data.category_name || "",
                    description: data.article || data.description || "",
                    tags: getTagsArray(data.tags),
                    thumbnail: data.image || null,
                    emptyImage: data.image || null,
                    platform: data.platform || "",
                    age: data.audience_age || data.age || "",
                    status: data.status,
                    resource_status: data.resource_status,
                    admin_approval: "pending",
                });
                setEmptyPreview(data.image || null);
            } catch (error) {
                setApiError("Failed to fetch resource from API");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResource();
    }, [id, isView]);


    // Fetch counsellors on mount
    useEffect(() => {
        const fetchCounsellors = async () => {
            setCounsellorsLoading(true);
            setCounsellorsError(null);
            try {
                const response = await axios.get('https://interactapiverse.com/mahadevasth/counsellors');
                let data = response.data?.data || response.data;
                if (Array.isArray(data)) {
                    setCounsellors(data.filter((c) => c && typeof c.full_name === 'string' && c.full_name));
                } else {
                    setCounsellors([]);
                }
            } catch (err) {
                setCounsellorsError('Failed to load counsellors');
                setCounsellors([]);
            } finally {
                setCounsellorsLoading(false);
            }
        };
        fetchCounsellors();
    }, []);

    const getSelectedCategoryId = () => {
        const cat = categories.find((c) => c.category === form.category_name);
        return cat ? cat.id : undefined;
    };

    const getSelectedCounsellorId = () => {
        const counsellor = counsellors.find((c) => c.full_name === form.author);
        return counsellor ? counsellor.user_id : undefined;
    };

    // Form Handlers
    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({...f, [e.target.id]: e.target.value}));
    };

    const handleSelect = (field: string, value: string) => {
        setForm((f) => ({...f, [field]: value}));
    };

    const handleFile = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                setApiError("Image size should be less than 1MB");
                return;
            }
            const base64 = await fileToBase64(file);
            setEmptyPreview(base64);
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

    const handleRemoveImage = () => {
        setEmptyPreview(null);
        setForm(f => ({...f, emptyImage: null}));
        if (emptyInputRef.current) emptyInputRef.current.value = '';
    };

    // Validation
    const validateForm = () => {
        const newErrors: ResourceFormErrors = {};
        if (!form.title.trim()) newErrors.title = "Title is required";
        if (!form.author.trim()) newErrors.author = "Author is required";
        if (!form.category_name) newErrors.category_name = "Category is required";
        if (!form.platform) newErrors.platform = "Platform is required";
        if (!form.age.trim()) newErrors.age = "Age is required";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (!form.tags || form.tags.length === 0) newErrors.tags = "At least one tag is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save to API
    const saveToAPI = async (isDraft: boolean = false) => {
        setIsLoading(true);
        setApiError(null);
        setApiSuccess(null);

        try {
            const payload = {
                admin_approval: 'pending',
                article: form.description,
                audience_age: form.age,
                category: getSelectedCategoryId(),
                counsellor_code: getSelectedCounsellorId(),
                created_at: new Date().toISOString(),
                image: form.emptyImage,
                platform: form.platform,
                resource_status: isDraft ? "draft" : form.resource_status,
                status: "published",
                tags: form.tags || [],
                title: form.title,
                ...(id && { id: id }) // Only include ID if we're updating
            };

            let response;
            if (id) {
                // Update existing resource
                response = await axios.put(
                    `https://interactapiverse.com/mahadevasth/shape/articles/${id}`,
                    payload
                );
            } else {
                // Create new resource
                console.log(payload)
                // response = await axios.post(
                //     "https://interactapiverse.com/mahadevasth/shape/articles/upload",
                //     payload
                // );
            }

            setApiSuccess(id ? "Resource updated successfully!" : "Resource created successfully!");
            setTimeout(() => navigate("/resources"), 2000);

            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            let errorMsg = "Failed to save resource";
            if (axios.isAxiosError(error)) {
                errorMsg = error.response?.data?.message || error.message;
            }
            setApiError(errorMsg);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Save to local storage as fallback
    const saveToLocal = (isDraft: boolean = false) => {
        const stored = localStorage.getItem("resources");
        let resources = stored ? JSON.parse(stored) : [];

        const resourceData = {
            ...form,
            id: id || Date.now(),
            tags: form.tags,
            thumbnail: emptyPreview,
            emptyImage: emptyPreview,
            publishDate: new Date().toISOString(),
            views: 0,
            likes: 0,
            status: isDraft ? "draft" : form.status
        };

        if (id) {
            resources = resources.map((r: any) =>
                String(r.id) === String(id) ? resourceData : r
            );
        } else {
            resources = [resourceData, ...resources];
        }

        localStorage.setItem("resources", JSON.stringify(resources));
        navigate("/resources");
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            // First try to save to API
            await saveToAPI(isDraft);
        } catch (error) {
            // If API fails, save to local storage
            console.log("API failed, saving to local storage");
            saveToLocal(isDraft);
        }
    };

    return (
        <>
            <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4"/>
                Back
            </Button>

            <form onSubmit={(e) => handleSubmit(e, false)}>
                <div>
                    <h1 className="text-3xl font-bold text-[#FF7119] mb-2 text-center md:text-left">
                        {isView ? "Resource Details" : id ? "Edit Resource" : "Add New Resource"}
                    </h1>
                    <p className="text-gray-600 mb-5 text-center md:text-left">
                        {isView ? "View all details for this resource." : "Fill in the details below."}
                    </p>

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error:</strong> {apiError}
                        </div>
                    )}

                    {apiSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                            <strong>Success:</strong> {apiSuccess}
                        </div>
                    )}

                    <Card className="p-6">
                        <div className="flex flex-col gap-4">
                            {/* Title and Category */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Title</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {form.title}
                                        </div>
                                    ) : (
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={handleInput}
                                            placeholder="Resource title..."
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                    )}
                                    {errors.title && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.title}</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label>Category</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {form.category_name || "-"}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.category_name}
                                            onValueChange={(v) => handleSelect("category_name", v)}
                                            disabled={categoriesLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoriesError && (
                                                    <div className="text-red-500 text-xs p-2">{categoriesError}</div>
                                                )}
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.category}>
                                                        {cat.category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors.category_name && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.category_name}</div>
                                    )}
                                </div>
                            </div>

                            {/* Author and Image */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Author</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {form.author}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.author}
                                            onValueChange={(v) => handleSelect("author", v)}
                                            disabled={counsellorsLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={counsellorsLoading ? "Loading..." : "Select author"}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {counsellorsError && (
                                                    <div className="text-red-500 text-xs p-2">{counsellorsError}</div>
                                                )}
                                                {counsellors.map((c) => (
                                                    <SelectItem key={c.user_id} value={c.full_name}>
                                                        {c.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {errors.author && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.author}</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label>Image</Label>
                                    {emptyPreview ? (
                                        <div className="relative mt-2 w-full max-w-xs">
                                            <img
                                                src={emptyPreview}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded"
                                            />
                                            {!isView && (
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 border border-gray-300"
                                                    onClick={handleRemoveImage}
                                                    aria-label="Remove image"
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

                            {/* Platform, Age, Status, Approval */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Platform</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {platforms.find(p => p.value === form.platform)?.label || form.platform}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.platform}
                                            onValueChange={(v) => handleSelect("platform", v)}
                                        >
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
                                    {errors.platform && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.platform}</div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label>Age</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {form.age}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.age}
                                            onValueChange={(v) => handleSelect("age", v)}
                                        >
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
                                    {errors.age && !isView && (
                                        <div className="text-red-500 text-xs mt-1">{errors.age}</div>
                                    )}
                                </div>


                            {/*    <div className="flex-1">*/}
                            {/*        <Label>Admin Approval</Label>*/}
                            {/*        {isView ? (*/}
                            {/*            <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">*/}
                            {/*                {form.admin_approval?.charAt(0).toUpperCase() + form.admin_approval?.slice(1) || "-"}*/}
                            {/*            </div>*/}
                            {/*        ) : (*/}
                            {/*            <Select*/}
                            {/*                value={form.admin_approval}*/}
                            {/*                onValueChange={(v) => handleSelect("admin_approval", v)}*/}
                            {/*            >*/}
                            {/*                <SelectTrigger>*/}
                            {/*                    <SelectValue placeholder="Select admin approval"/>*/}
                            {/*                </SelectTrigger>*/}
                            {/*                <SelectContent>*/}
                            {/*                    <SelectItem value="approved">Approved</SelectItem>*/}
                            {/*                    <SelectItem value="pending">Pending</SelectItem>*/}
                            {/*                    <SelectItem value="rejected">Rejected</SelectItem>*/}
                            {/*                </SelectContent>*/}
                            {/*            </Select>*/}
                            {/*        )}*/}
                            {/*    </div>*/}
                            </div>


                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Label>Resource Status</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {resourceStatusOptions.find(s => s.value === form.resource_status)?.label || form.resource_status}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.resource_status}
                                            onValueChange={(v) => handleSelect("resource_status", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select resource status"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {resourceStatusOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label>Status</Label>
                                    {isView ? (
                                        <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800">
                                            {statusOptions.find(s => s.value === form.status)?.label || form.status}
                                        </div>
                                    ) : (
                                        <Select
                                            value={form.status}
                                            onValueChange={(v) => handleSelect("status", v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <Label>Description</Label>
                                {isView ? (
                                    <div className="py-2 px-3 bg-gray-50 rounded border text-gray-800 min-h-[48px]">
                                        {form.description}
                                    </div>
                                ) : (
                                    <Textarea
                                        id="description"
                                        value={form.description}
                                        onChange={handleInput}
                                        placeholder="Resource description..."
                                        className={errors.description ? 'border-red-500' : ''}
                                        rows={6}
                                    />
                                )}
                                {errors.description && !isView && (
                                    <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                                )}
                            </div>

                            {/* Tags */}
                            <div>
                                <Label>Tags</Label>
                                {isView ? (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {form.tags && form.tags.length > 0 ? (
                                            form.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="bg-[#FF7119] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                                >
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">No tags</span>
                                        )}
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
                                            className={errors.tags ? 'border-red-500' : ''}
                                        />
                                        {errors.tags && (
                                            <div className="text-red-500 text-xs mt-1">{errors.tags}</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {!isView && (
                            <div className="flex flex-col md:flex-row gap-2 mt-10 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => handleSubmit(e, true)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Draft"}
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#012765] text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Publishing..." : "Publish Resource"}
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </form>
        </>
    );
}