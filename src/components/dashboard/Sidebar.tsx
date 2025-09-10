import React, { useState } from "react";
import {cn} from "@/lib/utils";
import {
    BarChart3,
    User,
    Users,
    FileText,
    MessageSquare,
    Star,
    BookOpen,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CalendarClock,
    PlusCircle,
    FileText as ArticleIcon,
    PlayCircle as VideoIcon
} from "lucide-react";
import logo from "../../../public/Emotionally Yours Logo.png";
import logo1 from "../../../public/logo.jpg";
import {Link, NavLink, useNavigate, useLocation} from "react-router-dom";
import { useUserContext } from "@/UserContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isMobile?: boolean;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    route: string;
}

const menuItems: MenuItem[] = [
    {id: "dashboard", label: "Dashboard", icon: BarChart3, route: "/dashboard"},
    {id: "beneficieries", label: "Beneficiaries", icon: User, route: "/Beneficieries"},
    {id: "assessments", label: "Assessments", icon: FileText, route: "/assessments"},
    {id: "inquiries", label: "Inquiries", icon: MessageSquare, route: "/inquiries"},
    {id: "users", label: "Users", icon: Users, route: "/users"},
    {id: "reflection-cards", label: "Reflection Cards", icon: Users, route: "/reflection-cards"},
    // {id: "feedback", label: "Feedback", icon: Star, route: "/feedback"},
    // {id: "notifications", label: "Notifications", icon: Bell, route: "/notifications"},
    {id: "settings", label: "Settings", icon: Settings, route: "/settings"},
];

const slotMenuItem = {
    id: "slot",
    label: "Slot",
    icon: PlusCircle,
    route: "/slot",
};

const appointmentMenuItem = {
    id: "appointments",
    label: "Appointments",
    icon: CalendarClock,
    route: "/appointments",
};

export const Sidebar: React.FC<SidebarProps> = ({
                                                    collapsed,
                                                    setCollapsed,
                                                    isMobile = false,
                                                    mobileOpen = false,
                                                    setMobileOpen,
                                                }) => {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);
    
    const isCounsellor = user?.role === "counsellor";
    const filteredMenuItems = isCounsellor
        ? [slotMenuItem, appointmentMenuItem]
        : menuItems;
    const dashboardLabel = isCounsellor ? "Counsellor Dashboard" : "Admin Dashboard";
    
    // Check if current path is resources or videos
    const isResourcesActive = location.pathname === "/resources" || location.pathname === "/videos";

    const handleResourcesNavigation = (path: string) => {
        navigate(path);
        setResourcesDropdownOpen(false);
        if (isMobile && setMobileOpen) {
            setMobileOpen(false);
        }
    };

    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                <div
                    className={cn(
                        "fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300",
                        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                />
                {/* Drawer */}
                <div
                    className={cn(
                        "fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-transform duration-300",
                        "w-64",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Header with Logo and Close Button */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                        <Link to="/dashboard">
                            <img
                                src={logo}
                                alt="Full Logo"
                                className="h-14 w-56 object-contain"
                            />
                        </Link>
                        {/* Close Button */}
                        <button
                            onClick={() => setMobileOpen && setMobileOpen(false)}
                            className="ml-2 bg-white border border-gray-300 shadow-md p-1.5 rounded-md hover:bg-gray-100 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600"/>
                        </button>
                    </div>
                    {/* Menu Items */}
                    <nav className="mt-6">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.route}
                                    className={({isActive}) =>
                                        cn(
                                            "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                            isActive
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119]"
                                                : "text-blue-950 hover:text-[#FF7119]"
                                        )
                                    }
                                    onClick={() => setMobileOpen && setMobileOpen(false)}
                                >
                                    <Icon className="h-5 w-5 mr-2"/>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            );
                        })}
                        
                        {/* Resources Dropdown for Mobile */}
                        {!isCounsellor && (
                            <div className="w-full">
                                <button
                                    onClick={() => setResourcesDropdownOpen(!resourcesDropdownOpen)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 rounded-lg mx-2",
                                        isResourcesActive
                                            ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119] shadow-sm"
                                            : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2"/>
                                        <span className="font-medium text-sm">Resources</span>
                                    </div>
                                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", resourcesDropdownOpen && "rotate-180")} />
                                </button>
                                
                                {resourcesDropdownOpen && (
                                    <div className="ml-4 space-y-1 mt-1 mr-2">
                                        <button
                                            onClick={() => handleResourcesNavigation("/resources")}
                                            className={cn(
                                                "w-full flex items-center px-4 py-3 text-left transition-all duration-200 rounded-lg group",
                                                location.pathname === "/resources"
                                                    ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm border border-[#FFD6B3]"
                                                    : "text-blue-950 hover:text-[#FF7119] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                                            )}
                                        >
                                            <ArticleIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                            <span className="font-medium text-sm">Articles</span>
                                        </button>
                                        <button
                                            onClick={() => handleResourcesNavigation("/videos")}
                                            className={cn(
                                                "w-full flex items-center px-4 py-3 text-left transition-all duration-200 rounded-lg group",
                                                location.pathname === "/videos"
                                                    ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm border border-[#FFD6B3]"
                                                    : "text-blue-950 hover:text-[#FF7119] hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                                            )}
                                        >
                                            <VideoIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                            <span className="font-medium text-sm">Videos</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                    {/* Footer */}
                    <div
                        className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] rounded-lg">
                        <div className="text-sm text-blue-950">
                            <p className="font-medium text-sm">{dashboardLabel}</p>
                            <p className="text-xs">Wellness Management System</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div
            className={cn(
                "fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header with Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                <Link to="/dashboard">
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
                </Link>

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
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.route}
                            className={({isActive}) =>
                                cn(
                                    "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119]"
                                        : "text-blue-950 hover:text-[#FF7119]",
                                    collapsed ? "justify-center" : "justify-start"
                                )
                            }
                            end={item.route === "/dashboard"}
                        >
                            <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")}/>
                            {!collapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </NavLink>
                    );
                })}
                
                {/* Resources Dropdown for Desktop */}
                {!isCounsellor && (
                    <div className="w-full">
                        {collapsed ? (
                            <DropdownMenu open={resourcesDropdownOpen} onOpenChange={setResourcesDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-full flex items-center justify-center px-4 py-3 text-left transition-all duration-200 rounded-lg mx-2 group",
                                            isResourcesActive
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119] shadow-sm"
                                                : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                        )}
                                    >
                                        <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="right" className="w-36 max-w-36 p-1 shadow-lg border-0 bg-white/95 backdrop-blur-sm ml-1">
                                    <DropdownMenuItem 
                                        onClick={() => handleResourcesNavigation("/resources")}
                                        className={cn(
                                            "flex items-center px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                                            location.pathname === "/resources"
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm"
                                                : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#FF7119]"
                                        )}
                                    >
                                        <ArticleIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium text-sm">Articles</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleResourcesNavigation("/videos")}
                                        className={cn(
                                            "flex items-center px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                                            location.pathname === "/videos"
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm"
                                                : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#FF7119]"
                                        )}
                                    >
                                        <VideoIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium text-sm">Videos</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu open={resourcesDropdownOpen} onOpenChange={setResourcesDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 group",
                                            isResourcesActive
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119] shadow-sm"
                                                : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200"/>
                                            <span className="font-medium text-sm">Resources</span>
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 group-hover:scale-110", resourcesDropdownOpen && "rotate-180")} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-36 max-w-36 p-1 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
                                    <DropdownMenuItem 
                                        onClick={() => handleResourcesNavigation("/resources")}
                                        className={cn(
                                            "flex items-center px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                                            location.pathname === "/resources"
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm"
                                                : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#FF7119]"
                                        )}
                                    >
                                        <ArticleIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium text-sm">Articles</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => handleResourcesNavigation("/videos")}
                                        className={cn(
                                            "flex items-center px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
                                            location.pathname === "/videos"
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119] shadow-sm"
                                                : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-[#FF7119]"
                                        )}
                                    >
                                        <VideoIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                        <span className="font-medium text-sm">Videos</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div
                    className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] rounded-lg">
                    <div className="text-sm text-blue-950">
                        <p className="font-medium text-sm">{dashboardLabel}</p>
                        <p className="text-xs">Wellness Management System</p>
                    </div>
                </div>
            )}
        </div>
    );
};
