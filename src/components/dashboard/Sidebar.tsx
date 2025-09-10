import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    User,
    FileText,
    Inbox,
    Users,
    BookOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CalendarClock,
    PlusCircle,
    FileText as ArticleIcon,
    PlayCircle as VideoIcon,
    StickyNote,
} from "lucide-react";

import logo from "../../../public/Emotionally Yours Logo.png";
import logo1 from "../../../public/logo.jpg";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/UserContext";

// ---------------------- CONFIG ----------------------
interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    route?: string;
    children?: MenuItem[];
}

const menusConfig: Record<string, MenuItem[]> = {
    admin: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, route: "/dashboard" },
        { id: "beneficieries", label: "Beneficiaries", icon: User, route: "/Beneficieries" },
        { id: "assessments", label: "Assessments", icon: FileText, route: "/assessments" },
        { id: "inquiries", label: "Inquiries", icon: Inbox, route: "/inquiries" }, // changed
        { id: "users", label: "Users", icon: Users, route: "/users" },
        {
            id: "resources",
            label: "Resources",
            icon: BookOpen,
            children: [
                { id: "articles", label: "Articles", icon: ArticleIcon, route: "/resources" },
                { id: "videos", label: "Videos", icon: VideoIcon, route: "/videos" },
            ],
        },
        { id: "reflection-cards", label: "Reflection Cards", icon: StickyNote, route: "/reflection-cards" }, // changed
        { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
    ],
    counsellor: [
        { id: "slot", label: "Slot", icon: PlusCircle, route: "/slot" },
        { id: "appointments", label: "Appointments", icon: CalendarClock, route: "/appointments" },
    ],
};

// ---------------------- COMPONENT ----------------------
interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isMobile?: boolean;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

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
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const role = user?.role === "counsellor" ? "counsellor" : "admin";
    const dashboardLabel = role === "counsellor" ? "Counsellor Dashboard" : "Admin Dashboard";
    const menuItems = menusConfig[role];

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile && setMobileOpen) setMobileOpen(false);
    };

    // ---------------------- MOBILE ----------------------
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
                        "fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-transform duration-300 w-64",
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
                        {menuItems.map((item) =>
                            item.children ? (
                                <div key={item.id} className="w-full">
                                    <button
                                        onClick={() => toggleMenu(item.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200",
                                            location.pathname.startsWith("/resources")
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                : "text-blue-950 hover:text-[#FF7119]"
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="h-5 w-5 mr-2" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 transition-transform duration-200",
                                                openMenus[item.id] && "rotate-180"
                                            )}
                                        />
                                    </button>
                                    {openMenus[item.id] && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => handleNavigation(child.route!)}
                                                    className={cn(
                                                        "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                                                        location.pathname === child.route
                                                            ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                            : "text-blue-950 hover:text-[#FF7119]"
                                                    )}
                                                >
                                                    <child.icon className="h-4 w-4 mr-2" />
                                                    <span className="text-sm font-medium">{child.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    key={item.id}
                                    to={item.route!}
                                    className={({ isActive }) =>
                                        cn(
                                            "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                            isActive
                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                : "text-blue-950 hover:text-[#FF7119]"
                                        )
                                    }
                                    onClick={() => setMobileOpen && setMobileOpen(false)}
                                >
                                    <item.icon className="h-5 w-5 mr-2" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            )
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

    // ---------------------- DESKTOP ----------------------
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
                {menuItems.map((item) =>
                    item.children ? (
                        <div key={item.id} className="w-full relative">
                            <button
                                onClick={() => toggleMenu(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200",
                                    location.pathname.startsWith("/resources")
                                        ? "text-[#FF7119]"
                                        : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50",
                                    collapsed && "justify-center"
                                )}
                            >
                                <div className="flex items-center">
                                    <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                                    {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                                </div>
                                {!collapsed && (
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-200",
                                            openMenus[item.id] && "rotate-180"
                                        )}
                                    />
                                )}
                            </button>

                            {/* Expanded Submenu */}
                            {openMenus[item.id] && (
                                <>
                                    {/* Expanded sidebar submenu */}
                                    {!collapsed && (
                                        <div className="mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.id}
                                                    to={child.route!}
                                                    className={({ isActive }) =>
                                                        cn(
                                                            "w-full flex items-center px-4 py-3 text-left transition-all duration-200 group",
                                                            isActive
                                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                                : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                        )
                                                    }
                                                >
                                                    <child.icon className="h-5 w-5 mr-2" />
                                                    <span className="font-medium text-sm">{child.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}

                                    {/* Flyout submenu (collapsed mode) */}
                                    {collapsed && (
                                        <div className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.id}
                                                    to={child.route!}
                                                    className={({ isActive }) =>
                                                        cn(
                                                            "flex items-center px-3 py-2 text-sm transition-all duration-200",
                                                            isActive
                                                                ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                                                : "text-blue-950 hover:text-[#FF7119] hover:bg-gray-50"
                                                        )
                                                    }
                                                >
                                                    <child.icon className="h-4 w-4 mr-2" />
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <NavLink
                            key={item.id}
                            to={item.route!}
                            className={({ isActive }) =>
                                cn(
                                    "w-full flex items-center px-4 py-3 text-left transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-[#FFE3CC] to-[#FFD6B3] text-[#FF7119]"
                                        : "text-blue-950 hover:text-[#FF7119]",
                                    collapsed ? "justify-center" : "justify-start"
                                )
                            }
                            end={item.route === "/dashboard"}
                        >
                            <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                        </NavLink>
                    )
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
