import React, { useState } from "react";
import Loading from "../../components/UI/Loading";
import Button from "../../components/UI/Button";
import FeedbackReports from "./FeedbackReports";
import PollReports from "./PollReports";
import UserReports from "./UserReports";

const Reports = () => {
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="space-y-6" dir="rtl">
      {isLoading && <Loading />}
      <div className="flex gap-2 sm:gap-4 rounded-xl border border-bmw-border bg-bmw-surface p-3 sm:p-4 shadow-sm">
        <Button
          variant={activeTab === "feedback" ? undefined : "ghost"}
          className="sm:flex-none text-xs sm:text-sm"
          onClick={() => setActiveTab("feedback")}
        >
          نظام پیشنهادها و انتقادات
        </Button>
        <Button
          variant={activeTab === "poll" ? undefined : "ghost"}
          className="sm:flex-none text-xs sm:text-sm"
          onClick={() => setActiveTab("poll")}
        >
          نظرسنجی
        </Button>
        <Button
          variant={activeTab === "userReports" ? undefined : "ghost"}
          className="sm:flex-none text-xs sm:text-sm"
          onClick={() => setActiveTab("userReports")}
        >
          کاربران
        </Button>
      </div>
      {activeTab === "feedback" && <FeedbackReports />}
      {activeTab === "poll" && <PollReports />}
      {activeTab === "userReports" && <UserReports />}
    </div>
  );
};

export default Reports;
