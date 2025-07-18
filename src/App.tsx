import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {DashboardOverview} from "@/components/dashboard/DashboardOverview";
import {Beneficiaries} from "@/components/dashboard/Beneficiaries.tsx";
import {AssessmentData} from "@/components/dashboard/AssessmentData";
import AssessmentForm from "@/pages/assessment/AssessmentForm";
import {InquiriesManagement} from "@/components/dashboard/InquiriesManagement";
import {FeedbackTracking} from "@/components/dashboard/FeedbackTracking";
import {ResourceManager} from "@/components/dashboard/ResourceManager";
import {NotificationsCenter} from "@/components/dashboard/NotificationsCenter";
import {SettingsPage} from "@/components/dashboard/SettingsPage";
import NotFound from "@/pages/NotFound";
import Users from "@/components/dashboard/Users";
import {UserProvider, useUserContext} from "@/UserContext";
import React from "react";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import InquiryNotes from "@/pages/InquiryNotes";

// PrivateRoute component
function PrivateRoute({children}: { children: React.ReactNode }) {
    const {user} = useUserContext();
    return user ? <>{children}</> : <Navigate to="/login" replace/>;
}

const App = () => (
    <UserProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route
                    element={
                        <PrivateRoute>
                            <DashboardLayout/>
                        </PrivateRoute>
                    }
                >
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                    <Route path="/dashboard" element={<DashboardOverview/>}/>
                    <Route path="/beneficieries" element={<Beneficiaries/>}/>
                    <Route path="/users" element={<Users/>}/>
                    <Route path="/assessments" element={<AssessmentData/>}/>
                    <Route path="/assessments/new" element={<AssessmentForm/>}/>
                    <Route path="/assessments/edit/:id" element={<AssessmentForm/>}/>
                    <Route path="/inquiries" element={<InquiriesManagement/>}/>
                    <Route path="/inquiries/:id/notes" element={<InquiryNotes/>}/>
                    <Route path="/feedback" element={<FeedbackTracking/>}/>
                    <Route path="/resources" element={<ResourceManager/>}/>
                    <Route path="/notifications" element={<NotificationsCenter/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                </Route>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    </UserProvider>
);

export default App;
