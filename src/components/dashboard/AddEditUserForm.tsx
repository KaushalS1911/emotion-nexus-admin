import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface UserFormValues {
  id?: number;
  profilePic?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  expertise?: string;
  experience?: string;
  education?: string;
}

interface AddEditUserFormProps {
  initialValues?: Partial<UserFormValues>;
  mode?: "add" | "edit";
  onSubmit: (values: UserFormValues) => void;
  onCancel?: () => void;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "super-admin", label: "Super Admin" },
  { value: "wellness-coach", label: "Wellness Coach" },
  { value: "support-staff", label: "Support Staff" },
  { value: "counsellor", label: "Counsellor" },
];

export default function AddEditUserForm({
  initialValues = {},
  mode = "add",
  onSubmit,
  onCancel,
}: AddEditUserFormProps) {
  const [profilePic, setProfilePic] = useState<string | null>(initialValues.profilePic || null);
  const [firstName, setFirstName] = useState(initialValues.firstName || "");
  const [lastName, setLastName] = useState(initialValues.lastName || "");
  const [email, setEmail] = useState(initialValues.email || "");
  const [role, setRole] = useState(initialValues.role || "admin");
  const [expertise, setExpertise] = useState(initialValues.expertise || "");
  const [experience, setExperience] = useState(initialValues.experience || "");
  const [education, setEducation] = useState(initialValues.education || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (role === "counsellor") {
      if (!expertise.trim()) newErrors.expertise = "Expertise is required";
      if (!experience.trim()) newErrors.experience = "Experience is required";
      if (!education.trim()) newErrors.education = "Education is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      id: initialValues.id,
      profilePic,
      firstName,
      lastName,
      email,
      role,
      expertise: role === "counsellor" ? expertise : undefined,
      experience: role === "counsellor" ? experience : undefined,
      education: role === "counsellor" ? education : undefined,
    });
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex flex-row items-start gap-20">
            <div className="flex flex-col items-center min-w-[120px] pt-2">
              <Avatar className="h-36 w-36">
                {profilePic ? (
                  <img src={profilePic} alt="Profile Preview" className="w-36 h-36 rounded-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-[#012765] text-white  text-5xl">
                    {firstName?.[0]?.toUpperCase() || "U"}{lastName?.[0]?.toUpperCase() || ""}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button type="button" variant="outline" className="mt-7 font-normal px-4 py-2" onClick={() => document.getElementById('user-profile-pic')?.click()}>
                Change Avatar
              </Button>
              <Input id="user-profile-pic" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              <span className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</span>
            </div>
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-first-name" className="font-semibold">First Name</Label>
                  <Input id="user-first-name" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" />
                  {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                </div>
                <div>
                  <Label htmlFor="user-last-name" className="font-semibold">Last Name</Label>
                  <Input id="user-last-name" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" />
                  {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
                </div>
              </div>
              <div>
                <Label htmlFor="user-email" className="font-semibold">Email Address</Label>
                <Input id="user-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>
              <div>
                <Label htmlFor="user-role" className="font-semibold">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {role === "counsellor" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="user-expertise" className="font-semibold">Expertise</Label>
                    <Input id="user-expertise" value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="Expertise" />
                    {errors.expertise && <div className="text-red-500 text-xs mt-1">{errors.expertise}</div>}
                  </div>
                  <div>
                    <Label htmlFor="user-experience" className="font-semibold">Experience</Label>
                    <Input id="user-experience" value={experience} onChange={e => setExperience(e.target.value)} placeholder="Experience" />
                    {errors.experience && <div className="text-red-500 text-xs mt-1">{errors.experience}</div>}
                  </div>
                  <div>
                    <Label htmlFor="user-education" className="font-semibold">Education</Label>
                    <Input id="user-education" value={education} onChange={e => setEducation(e.target.value)} placeholder="Education" />
                    {errors.education && <div className="text-red-500 text-xs mt-1">{errors.education}</div>}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Button type="submit" className="bg-[#012765] text-white px-6 py-2 rounded-md font-semibold shadow  transition-all duration-150">
                  {mode === "edit" ? "Save Changes" : "Add User"}
                </Button>
                {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="ml-2 px-6 py-2 rounded-md font-semibold">Cancel</Button>}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 