import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Payslips from "../pages/Pay/Payslips";
import Documents from "../pages/Documents";
import FoodOrder from "../pages/FoodOrder/FoodOrder";
import CalendarView from "../pages/CalendarView";
import Support from "../pages/Support";
import Surveys from "../pages/Polls/Surveys";
import OrganizationERP from "../pages/OrganizationERP";
import NewsPage from "../pages/NewsPage";
import NewsArticle from "../pages/NewsArticle";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";
import AllNewsRoute from "../pages/News/AllNewsRoute";
import ShowQuestionsPoll from "../pages/Polls/ShowQuestionsPoll";

export const RoutesApp: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/allNews" element={<AllNewsRoute />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/food" element={<FoodOrder />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/support" element={<Support />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/surveys/questions" element={<ShowQuestionsPoll />} />
            <Route path="/erp" element={<OrganizationERP />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsArticle />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
