"use client";

import {useState} from "react";
import {Bell, Search, Menu} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useNavigate} from "react-router-dom";

interface DashboardHeaderProps {
    toggleSidebar: () => void;
    sidebarCollapsed: boolean;
}

const pages = [
    {name: "Dashboard", path: "/dashboard"},
    {name: "Beneficieries", path: "/beneficieries"},
    {name: "Assessments", path: "/assessments"},
    {name: "Inquiries", path: "/inquiries"},
    {name: "Feedback", path: "/feedback"},
    {name: "Resources", path: "/resources"},
    {name: "Notification", path: "/notifications"},
    {name: "Settings", path: "/settings"},
];

export const DashboardHeader = ({toggleSidebar}: DashboardHeaderProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredPages, setFilteredPages] = useState<typeof pages>([]);
    const navigate = useNavigate();
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        const filtered = pages.filter((page) =>
            page.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPages(filtered);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilteredPages([]);
    };

    return (
        <header className="bg-white shadow-md border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5"/>
                    </Button>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                        <Input
                            placeholder="Search users, assessments..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />

                        {/* Search Results Dropdown */}
                        {searchQuery && filteredPages.length > 0 && (
                            <div
                                className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                {filteredPages.map((page) => (
                                    <a
                                        key={page.path}
                                        href={page.path}
                                        onClick={clearSearch}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {page.name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5"/>
                        <span
                            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarFallback className="bg-[#012765] text-white">
                                        AD
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        admin@emotionallyyours.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                            <DropdownMenuItem>Account</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                sessionStorage.removeItem("admin-token")
                                navigate("/login")
                            }}>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
