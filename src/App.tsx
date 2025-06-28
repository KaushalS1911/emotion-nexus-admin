import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { AssessmentData } from "@/components/dashboard/AssessmentData";
import AssessmentForm from "@/pages/assessment/AssessmentForm";
import { InquiriesManagement } from "@/components/dashboard/InquiriesManagement";
import { FeedbackTracking } from "@/components/dashboard/FeedbackTracking";
import { ResourceManager } from "@/components/dashboard/ResourceManager";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { SettingsPage } from "@/components/dashboard/SettingsPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/assessments" element={<AssessmentData />} />
        <Route path="/assessments/new" element={<AssessmentForm />} />
        <Route path="/assessments/edit/:id" element={<AssessmentForm />} />
        <Route path="/inquiries" element={<InquiriesManagement />} />
        <Route path="/feedback" element={<FeedbackTracking />} />
        <Route path="/resources" element={<ResourceManager />} />
        <Route path="/notifications" element={<NotificationsCenter />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
