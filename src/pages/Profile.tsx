import React from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Edit2,
  Shield,
  Calendar,
  UserRound,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAppSelector } from "../features/store";

const Profile: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const user = useAppSelector((state) => state);
  const firstName = user?.main?.userLogin?.FirstName;
  const lastName = user?.main?.userLogin?.LastName;
  const department = user?.main?.userLogin?.Department;
  const personalCode = user?.main?.userLogin?.PersonalCode;
  const email = user?.main?.userLogin?.Email;
  const mobile = user?.main?.userLogin?.Mobile;
  const employmentDate = user?.main?.userLogin?.EmploymentDate;

  const profileData = {
    en: {
      name: "Behzad Naderloo",
      address: "Tehran HQ, 4th Floor",
      dept: "Sales & Marketing",
      date: "March 12, 2018",
      desc: "Responsible for overseeing the sales team at the central branch, ensuring targets are met, and maintaining high standards of customer service consistent with the BMW brand.",
      bullets: [
        "Develop and implement strategic sales plans.",
        "Manage customer relationships and resolve escalations.",
        "Coordinate with the marketing team for product launches.",
        "Prepare monthly performance reports for the board.",
      ],
      manager: "Hossein Tehrani",
      sub1: "Sara Mohammadi",
      sub2: "Reza Karimi",
    },
    fa: {
      address: "دفتر مرکزی تهران، طبقه ۴",
      dept: "فروش و بازاریابی",
      date: "۲۲ اسفند ۱۳۹۶",
      desc: "مسئول نظارت بر تیم فروش در شعبه مرکزی، اطمینان از تحقق اهداف و حفظ استانداردهای بالای خدمات مشتری مطابق با برند BMW.",
      bullets: [
        "توسعه و اجرای استراتژی‌های فروش.",
        "مدیریت روابط با مشتریان و حل مشکلات پیچیده.",
        "هماهنگی با تیم بازاریابی برای معرفی محصولات جدید.",
        "تهیه گزارش‌های ماهانه عملکرد برای هیئت مدیره.",
      ],
      manager: "حسین تهرانی",
      sub1: "سارا محمدی",
      sub2: "رضا کریمی",
    },
  };

  const data = profileData[language === "fa" ? "fa" : "en"];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="relative mb-16">
        <div className="h-48 w-full from-gray-900 to-bmw-border rounded-xl overflow-hidden relative">
          <img
            src="/assets/profilecover.png"
            alt="Cover"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 from-bmw-base to-transparent"></div>
        </div>
        <div
          className={`absolute -bottom-12 ${dir === "rtl" ? "right-8" : "left-8"} flex items-end gap-6`}
        >
          {false ? (
            <img
              src="/assets/1002.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="text-gray-500 text-9xl w-26 h-26 bg-white rounded-full p-1 border border-gray-300 flex justify-center" />
          )}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-bmw-text">
              {firstName} {lastName}
            </h1>
            <p className="text-bmw-blue font-medium">{department}</p>
          </div>
        </div>
        {/* <button
          className={`absolute bottom-4 ${dir === "rtl" ? "left-4" : "right-4"} bg-bmw-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-black/20`}
        >
          <Edit2 size={16} /> {t("edit_profile")}
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <h3 className="text-bmw-text font-bold mb-4 border-b border-bmw-border pb-2">
              {t("contact_info")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-bmw-textSec">
                <Mail size={18} className="text-gray-500" />
                <span className="text-sm">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-bmw-textSec">
                <Phone size={18} className="text-gray-500" />
                <span className="text-sm" dir="ltr">
                  {mobile}
                </span>
              </div>
              <div className="flex items-center gap-3 text-bmw-textSec">
                <MapPin size={18} className="text-gray-500" />
                <span className="text-sm">{data.address}</span>
              </div>
            </div>
          </div>
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <h3 className="text-bmw-text font-bold mb-4 border-b border-bmw-border pb-2">
              {t("employment_details")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-bmw-textSec">
                <Shield size={18} className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    {t("employee_id")}
                  </span>
                  <span className="text-sm font-mono" dir="ltr">
                    {personalCode}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-bmw-textSec">
                <Briefcase size={18} className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">{t("dept")}</span>
                  <span className="text-sm">{department}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-bmw-textSec">
                <Calendar size={18} className="text-gray-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">{t("joined")}</span>
                  <span className="text-sm">{employmentDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Job Description & Integration */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-bmw-text">
                {t("job_desc")}
              </h3>
              <span className="px-3 py-1 bg-green-900/10 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900 rounded text-xs">
                {t("active")}
              </span>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-bmw-textSec space-y-4">
              <p>{data.desc}</p>
              <ul className="list-disc ps-5 space-y-1 opacity-80">
                {data.bullets.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-bmw-text mb-4">
              {t("org_chart")}
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-bmw-border bg-bmw-hover opacity-70">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                  <img
                    src="/assets/1002.jpg"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-bmw-text">
                    {data.manager}
                  </p>
                  <p className="text-xs text-bmw-textSec">{t("vp_sales")}</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg border border-bmw-blue bg-blue-900/10 ${dir === "rtl" ? "mr-8" : "ml-8"} relative`}
              >
                <div
                  className={`absolute ${dir === "rtl" ? "-right-8" : "-left-8"} top-1/2 w-8 h-px bg-bmw-border`}
                ></div>
                <div
                  className={`absolute ${dir === "rtl" ? "-right-8" : "-left-8"} top-0 h-1/2 w-px bg-bmw-border`}
                ></div>
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-bmw-blue">
                  <img
                    src="/assets/1002.jpg"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  {/* <p className="text-sm font-bold text-bmw-text">{}</p> */}
                  <p className="text-xs text-bmw-blue">{t("senior_manager")}</p>
                </div>
              </div>

              {/* Subordinates */}
              <div
                className={`${dir === "rtl" ? "mr-16" : "ml-16"} space-y-3 relative`}
              >
                <div
                  className={`absolute ${dir === "rtl" ? "-right-8" : "-left-8"} -top-6 bottom-4 w-px bg-bmw-border`}
                ></div>
                {[data.sub1, data.sub2].map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg border border-bmw-border bg-bmw-hover relative"
                  >
                    <div
                      className={`absolute ${dir === "rtl" ? "-right-8" : "-left-8"} top-1/2 w-8 h-px bg-bmw-border`}
                    ></div>
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                      <img
                        src="/assets/1002.jpg"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-bmw-text">{name}</p>
                      <p className="text-xs text-bmw-textSec">
                        {t("sales_exec")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
