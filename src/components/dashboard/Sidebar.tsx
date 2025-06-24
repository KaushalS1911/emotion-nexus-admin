
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  FileText, 
  MessageSquare, 
  Star, 
  BookOpen, 
  Bell, 
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "User Management", icon: Users },
  { id: "assessments", label: "Assessment Data", icon: FileText },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              EmotionallyYours
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50",
                activeTab === item.id
                  ? "bg-gradient-to-r from-purple-100 to-blue-100 border-r-2 border-purple-500 text-purple-700"
                  : "text-gray-600 hover:text-purple-600",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Admin Dashboard</p>
            <p className="text-xs">Wellness Management System</p>
          </div>
        </div>
      )}
    </div>
  );
};
