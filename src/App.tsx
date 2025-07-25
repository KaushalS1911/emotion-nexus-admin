import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { Beneficiaries } from "@/components/dashboard/Beneficiaries.tsx";
import { AssessmentData } from "@/components/dashboard/AssessmentData";
import AssessmentForm from "@/pages/assessment/AssessmentForm";
import { InquiriesManagement } from "@/components/dashboard/InquiriesManagement";
import { FeedbackTracking } from "@/components/dashboard/FeedbackTracking";
import { ResourceManager } from "@/components/dashboard/ResourceManager";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import NotFound from "@/pages/NotFound";
import Users from "@/components/dashboard/Users";
import { UserProvider, useUserContext } from "@/UserContext";
import React from "react";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import InquiryNotes from "@/pages/InquiryNotes";
import SlotPage from "@/pages/SlotPage";
import NewUserPage from "@/pages/NewUserPage";
import AppointmentPage from "@/pages/AppointmentPage.tsx";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user } = useUserContext();
    return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
    const { user } = useUserContext();
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) {
        if (user.role === "counsellor") return <Navigate to="/slot" replace />;
        return <Navigate to="/notfound" replace />;
    }
    return <>{children}</>;
}

function RoleBasedDefaultRedirect() {
    const { user } = useUserContext();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    if (user.role === "counsellor") return <Navigate to="/slot" replace />;
    return <Navigate to="/login" replace />;
}

const App = () => (
    <UserProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    element={
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/" element={<RoleBasedDefaultRedirect />} />
                    <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={["admin"]}><DashboardOverview /></RoleProtectedRoute>} />
                    <Route path="/beneficieries" element={<RoleProtectedRoute allowedRoles={["admin"]}><Beneficiaries /></RoleProtectedRoute>} />
                    <Route path="/users" element={<RoleProtectedRoute allowedRoles={["admin"]}><Users /></RoleProtectedRoute>} />
                    <Route path="/new-user" element={<RoleProtectedRoute allowedRoles={["admin"]}><NewUserPage /></RoleProtectedRoute>} />
                    <Route path="/edit-user" element={<RoleProtectedRoute allowedRoles={["admin"]}><NewUserPage /></RoleProtectedRoute>} />
                    <Route path="/assessments" element={<RoleProtectedRoute allowedRoles={["admin"]}><AssessmentData /></RoleProtectedRoute>} />
                    <Route path="/assessments/new" element={<RoleProtectedRoute allowedRoles={["admin"]}><AssessmentForm /></RoleProtectedRoute>} />
                    <Route path="/assessments/edit/:id" element={<RoleProtectedRoute allowedRoles={["admin"]}><AssessmentForm /></RoleProtectedRoute>} />
                    <Route path="/inquiries" element={<RoleProtectedRoute allowedRoles={["admin"]}><InquiriesManagement /></RoleProtectedRoute>} />
                    <Route path="/inquiries/:id/notes" element={<RoleProtectedRoute allowedRoles={["admin"]}><InquiryNotes /></RoleProtectedRoute>} />
                    <Route path="/feedback" element={<RoleProtectedRoute allowedRoles={["admin"]}><FeedbackTracking /></RoleProtectedRoute>} />
                    <Route path="/resources" element={<RoleProtectedRoute allowedRoles={["admin"]}><ResourceManager /></RoleProtectedRoute>} />
                    <Route path="/notifications" element={<RoleProtectedRoute allowedRoles={["admin"]}><NotificationsCenter /></RoleProtectedRoute>} />
                    <Route path="/settings" element={<RoleProtectedRoute allowedRoles={["admin"]}><SettingsPage /></RoleProtectedRoute>} />
                    <Route path="/slot" element={<RoleProtectedRoute allowedRoles={["counsellor"]}><SlotPage /></RoleProtectedRoute>} />
                    <Route path="/appointments" element={<RoleProtectedRoute allowedRoles={["counsellor"]}><AppointmentPage /></RoleProtectedRoute>} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </UserProvider>
);

export default App;
