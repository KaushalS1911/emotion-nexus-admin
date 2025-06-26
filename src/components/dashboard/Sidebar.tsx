import React from "react";
import {cn} from "@/lib/utils";
import {
    BarChart3,
    Users,
    FileText,
    MessageSquare,
    Star,
    BookOpen,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import logo from "../../../public/Emotionally Yours Logo.png";
import logo1 from "../../../public/logo.jpg";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

const menuItems: MenuItem[] = [
    {id: "dashboard", label: "Dashboard", icon: BarChart3},
    {id: "users", label: "Users", icon: Users},
    {id: "assessments", label: "Assessments", icon: FileText},
    {id: "inquiries", label: "Inquiries", icon: MessageSquare},
    {id: "feedback", label: "Feedback", icon: Star},
    {id: "resources", label: "Resources", icon: BookOpen},
    {id: "notifications", label: "Notifications", icon: Bell},
    {id: "settings", label: "Settings", icon: Settings},
];

export const Sidebar: React.FC<SidebarProps> = ({
                                                    activeTab,
                                                    setActiveTab,
                                                    collapsed,
                                                    setCollapsed,
                                                }) => {
    return (
        <div
            className={cn(
                "fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header with Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                {collapsed ? (
                    <img
                        src={logo1}
                        alt="Logo small"
                        className="h-10 w-10 rounded-full mx-auto"
                    />
                ) : (
                    <img
                        src={logo}
                        alt="Full Logo"
                        className="h-14 w-56 object-contain"
                    />
                )}

                {/* Collapse Toggle Button */}
                <div className="absolute top-6 -right-4 z-50">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="bg-white border border-gray-300 shadow-md p-1.5 rounded-md hover:bg-gray-100 transition-all"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-600"/>
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-gray-600"/>
                        )}
                    </button>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="mt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                activeTab === item.id
                                    ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119]"
                                    : "text-blue-950 hover:text-[#FF7119]",
                                collapsed ? "justify-center" : "justify-start"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")}/>
                            {!collapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div
                    className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] rounded-lg">
                    <div className="text-sm text-blue-950">
                        <p className="font-medium">Admin Dashboard</p>
                        <p className="text-xs">Wellness Management System</p>
                    </div>
                </div>
            )}
        </div>
    );
};
