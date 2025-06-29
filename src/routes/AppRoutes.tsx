import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import MainLayout from "../Layout/MainLayout";
import ProtectedRoute from "./ProtectedRoutes";
import About from "../pages/About";
import Projects from "../pages/Projects";
import KnowledgeCenter from "../pages/KnowledgeCenter";
import Document from "../pages/Document";
import DataMaster from "../pages/DataMaster";
import Profile from "../pages/Profile";
import Module from "../Components/Module";
import CreateDocument from "../Components/CreateDocument";
import { EmployeeRegistration } from "../Components/EmployeeRegistration";
import { HolidayCalender } from "../Components/HolidayCalender";
import ManageUser from "../Components/ManageUser";
import ModuleLibrary from "../Components/ModuleLibrary";
import NotificationLibrary from "../Components/NotificationLibrary";
import { RegisterNewProject } from "../Components/RegisterNewProject";
import StatusUpdate from "../Components/StatusUpdate";
import TimelineBuilder from "../Components/TimelineBuilder";
import ViewDocumentPage from "../Components/ViewDocumentPage";
import ViewUser from "../Components/ViewUser";
import CreateNotification from "../Components/CreateNotification";
import LandingPage from "../pages/LandingPage";
import Pricing from "../pages/Pricing";
import Services from "../pages/Services";
import Hero from "../pages/Hero";
import Contact from "../pages/Contact";

const AppRoutes = () => {
    const isAuthenticated = !!localStorage.getItem('user');

    return (
        <Router>
            <Routes>
                <Route
                    path="/home"
                    element={
                        isAuthenticated
                            ? <Navigate to="/dashboard" replace />
                            : <Home />
                    }
                >
                    <Route index element={<Hero />} />
                    <Route path="services" element={<Services />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="contacts" element={<Contact />} />
                </Route>
                <Route
                    path="/"
                    element={
                        isAuthenticated
                            ? <Navigate to="/dashboard" replace />
                            : <Navigate to="/home" replace />
                    }
                />
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/landing-page" element={<LandingPage />} />
                    <Route path="/not-found" element={<NotFound />} />
                    <Route path="/create/register-new-project" element={<RegisterNewProject />} />
                    <Route path="/employee-registration" element={<EmployeeRegistration />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create/project-timeline" element={<StatusUpdate />} />
                    <Route path="/create/module-library" element={<ModuleLibrary />} />
                    <Route path="/create/non-working-days" element={<HolidayCalender />} />
                    <Route path="/create/raci-alert-notification" element={<ManageUser />} />
                    <Route path="/view-user" element={<ViewUser />} />
                    <Route path="/create/document" element={<CreateDocument />} />
                    <Route path="/view-document" element={<ViewDocumentPage />} />
                    <Route path="/notificationlibrary" element={<NotificationLibrary />} />
                    <Route path="/create/timeline-builder" element={<TimelineBuilder />} />
                    <Route path="/data-master" element={<DataMaster />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/dashboard" element={<Projects />} />
                    <Route path="/modules" element={<Module />} />
                    <Route path="/knowledge-center" element={<KnowledgeCenter />} />
                    <Route path="/document" element={<Document />} />
                    <Route path="/create/notification" element={<CreateNotification />} />
                    <Route path="*" element={<Navigate to="/not-found" replace />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
