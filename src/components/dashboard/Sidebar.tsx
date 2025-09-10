import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    User,
    Users,
    FileText,
    MessageSquare,
    BookOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CalendarClock,
    PlusCircle,
    FileText as ArticleIcon,
    PlayCircle as VideoIcon,
} from "lucide-react";
import logo from "../../../public/Emotionally Yours Logo.png";
import logo1 from "../../../public/logo.jpg";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/UserContext";

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
    { id: "dashboard", label: "Dashboard", icon: BarChart3, route: "/dashboard" },
    { id: "beneficieries", label: "Beneficiaries", icon: User, route: "/Beneficieries" },
    { id: "assessments", label: "Assessments", icon: FileText, route: "/assessments" },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare, route: "/inquiries" },
    { id: "users", label: "Users", icon: Users, route: "/users" },
    { id: "reflection-cards", label: "Reflection Cards", icon: Users, route: "/reflection-cards" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
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
    const [resourcesOpen, setResourcesOpen] = useState(false);

    const isCounsellor = user?.role === "counsellor";
    const filteredMenuItems = isCounsellor ? [slotMenuItem, appointmentMenuItem] : menuItems;
    const dashboardLabel = isCounsellor ? "Counsellor Dashboard" : "Admin Dashboard";

    // Active check
    const isResourcesActive =
        location.pathname === "/resources" || location.pathname === "/videos";

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile && setMobileOpen) setMobileOpen(false);
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
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                        <Link to="/dashboard">
                            <img src={logo} alt="Full Logo" className="h-14 w-56 object-contain" />
                        </Link>
                        <button
                            onClick={() => setMobileOpen && setMobileOpen(false)}
                            className="ml-2 bg-white border border-gray-300 shadow-md p-1.5 rounded-md hover:bg-gray-100 transition-all"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>

                    {/* Menu */}
                    <nav className="mt-6">
                        {filteredMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.route}
                                    className={({ isActive }) =>
                                        cn(
                                            "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                            isActive
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119]"
                                                : "text-blue-950 hover:text-[#FF7119]"
                                        )
                                    }
                                    onClick={() => setMobileOpen && setMobileOpen(false)}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            );
                        })}

                        {/* Resources Accordion (Mobile) */}
                        {!isCounsellor && (
                            <div className="w-full">
                                <button
                                    onClick={() => setResourcesOpen(!resourcesOpen)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200",
                                        isResourcesActive
                                            ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119]"
                                            : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <BookOpen className="h-5 w-5 mr-2" />
                                        <span className="font-medium text-sm">Resources</span>
                                    </div>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            resourcesOpen && "rotate-180"
                                        )}
                                    />
                                </button>

                                {resourcesOpen && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        <button
                                            onClick={() => handleNavigation("/resources")}
                                            className={cn(
                                                "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                                                location.pathname === "/resources"
                                                    ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                    : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                            )}
                                        >
                                            <ArticleIcon className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Articles</span>
                                        </button>
                                        <button
                                            onClick={() => handleNavigation("/videos")}
                                            className={cn(
                                                "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                                                location.pathname === "/videos"
                                                    ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                    : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                            )}
                                        >
                                            <VideoIcon className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Videos</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] rounded-lg">
                        <div className="text-sm text-blue-950">
                            <p className="font-medium text-sm">{dashboardLabel}</p>
                            <p className="text-xs">Wellness Management System</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Desktop Sidebar
    return (
        <div
            className={cn(
                "fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                <Link to="/dashboard">
                    {collapsed ? (
                        <img src={logo1} alt="Logo small" className="h-10 w-10 rounded-full mx-auto" />
                    ) : (
                        <img src={logo} alt="Full Logo" className="h-14 w-56 object-contain" />
                    )}
                </Link>
                <div className="absolute top-6 -right-4 z-50">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="bg-white border border-gray-300 shadow-md p-1.5 rounded-md hover:bg-gray-100 transition-all"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-600" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Menu */}
            <nav className="mt-6">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.route}
                            className={({ isActive }) =>
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
                            <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                        </NavLink>
                    );
                })}

                {/* Resources Accordion (Desktop) */}
                {!isCounsellor && (
                    <div className="w-full relative">
                        <button
                            onClick={() => setResourcesOpen(!resourcesOpen)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200",
                                isResourcesActive
                                    ? "text-[#FF7119]"
                                    : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50",
                                collapsed && "justify-center"
                            )}
                        >
                            <div className="flex items-center">
                                <BookOpen className={cn("h-5 w-5", !collapsed && "mr-2")} />
                                {!collapsed && <span className="font-medium text-sm">Resources</span>}
                            </div>
                            {!collapsed && (
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        resourcesOpen && "rotate-180"
                                    )}
                                />
                            )}
                        </button>

                        {resourcesOpen && (
                            <>
                                {/* Normal submenu when expanded & sidebar not collapsed */}
                                {!collapsed && (
                                    <div className="mt-1 space-y-1">
                                        <NavLink
                                            to="/resources"
                                            className={({ isActive }) =>
                                                cn(
                                                    "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 group",
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119] shadow-sm"
                                                        : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                )
                                            }
                                        >
                                            <div className="flex items-center">
                                                <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                                <span className="font-medium text-sm">Articles</span>
                                            </div>
                                        </NavLink>
                                        <NavLink
                                            to="/videos"
                                            className={({ isActive }) =>
                                                cn(
                                                    "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 group",
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] border-r-2 border-[#FF7119] text-[#FF7119] shadow-sm"
                                                        : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                )
                                            }
                                        >
                                            <div className="flex items-center">
                                                <VideoIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                                                <span className="font-medium text-sm">Videos</span>
                                            </div>
                                        </NavLink>
                                    </div>
                                )}

                                {/* Flyout submenu when collapsed */}
                                {collapsed && (
                                    <div className="absolute left-full top-0 mt-0 ml-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50">
                                        <NavLink
                                            to="/resources"
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center px-3 py-2 text-sm transition-all duration-200",
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                        : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                )
                                            }
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Articles
                                        </NavLink>
                                        <NavLink
                                            to="/videos"
                                            className={({ isActive }) =>
                                                cn(
                                                    "flex items-center px-3 py-2 text-sm transition-all duration-200",
                                                    isActive
                                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                        : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                )
                                            }
                                        >
                                            <VideoIcon className="h-4 w-4 mr-2" />
                                            Videos
                                        </NavLink>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] rounded-lg">
                    <div className="text-sm text-blue-950">
                        <p className="font-medium text-sm">{dashboardLabel}</p>
                        <p className="text-xs">Wellness Management System</p>
                    </div>
                </div>
            )}
        </div>
    );
};
