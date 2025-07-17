import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User, Shield, Bell, Database, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#FF7119]">
          Settings
        </h1>
        <p className="text-gray-600 mt-2 text-[#012765]">Manage your admin preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-[#012765] text-white">AD</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline">Change Avatar</Button>
                <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Admin" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="User" />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="admin@emotionallyyours.com" />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="super-admin">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="wellness-coach">Wellness Coach</SelectItem>
                  <SelectItem value="support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-[#012765] text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Add User Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Add User</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddUserForm />
          </CardContent>
        </Card>
      </div>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email alerts for important events</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New User Registrations</p>
              <p className="text-sm text-gray-500">Get notified when new users join</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Alerts</p>
              <p className="text-sm text-gray-500">Critical system notifications</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-gray-500">Automated weekly summary reports</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* System Configuration */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                  <SelectItem value="cst">Central Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" />
            </div>

            <div>
              <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
              <Input id="maxFileSize" type="number" defaultValue="10" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Enable to temporarily disable user access</p>
            </div>
            <Switch />
          </div>

          <Button className="bg-[#012765] text-white">
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

function AddUserForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = "Invalid email";
    if (!role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const roleOptions = [
    { value: "Super Admin", label: "Super Admin" },
    { value: "Admin", label: "Admin" },
    { value: "Wellness Coach", label: "Wellness Coach" },
    { value: "Support Staff", label: "Support Staff" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Add user to localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const newUser = {
      id: Date.now(),
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      role,
      status: "active",
      joinDate: new Date().toISOString().slice(0, 10),
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("");
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="add-user-firstName">First Name</Label>
        <Input id="add-user-firstName" value={firstName} onChange={e => { setFirstName(e.target.value); setAdded(false); }} placeholder="Enter first name" />
        {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
      </div>
      <div>
        <Label htmlFor="add-user-lastName">Last Name</Label>
        <Input id="add-user-lastName" value={lastName} onChange={e => { setLastName(e.target.value); setAdded(false); }} placeholder="Enter last name" />
        {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
      </div>
      <div>
        <Label htmlFor="add-user-email">Email</Label>
        <Input id="add-user-email" type="email" value={email} onChange={e => { setEmail(e.target.value); setAdded(false); }} placeholder="Enter email address" />
        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
      </div>
      <div>
        <Label htmlFor="add-user-role">Role</Label>
        <Select value={role} onValueChange={val => { setRole(val); setAdded(false); }}>
          <SelectTrigger id="add-user-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
      </div>
      <Button type="submit" className="bg-[#012765] text-white w-full">Add User</Button>
      {added && <div className="text-green-600 text-sm mt-2">User Added</div>}
    </form>
  );
}
