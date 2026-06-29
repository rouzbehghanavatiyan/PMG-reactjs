import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Shield,
  Calendar,
  Plus,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAppSelector } from "../features/store";
import CustomImage from "../components/UI/CustomImage";
import BackPMG from "../assets/profilecover.png";
import Button from "../components/UI/Button";
import { useHasPermission } from "../hooks/usePermissions";
import { asyncWrapper } from "../utils/asyncWrapper";
import { updatedProfile } from "../services/dotNet";
import { useToast } from "../hooks/useToast";

const Profile: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const user = useAppSelector((state) => state);
  const [showBirthday, setShowBirthday] = useState(false);
  const firstName = user?.main?.userProfile?.userLogin?.firstName;
  const lastName = user?.main?.userProfile?.userLogin?.lastName;
  const department = user?.main?.userProfile?.userLogin?.department;
  const personalCode = user?.main?.userProfile?.userLogin?.personalCode;
  const email = user?.main?.userProfile?.userLogin?.email;
  const isActiveBirthdayJWT =
    user?.main?.userProfile?.userLogin?.isActiveBirthday;
  const mobile = user?.main?.userProfile?.userLogin?.mobile;
  const employmentDate = user?.main?.userProfile?.userLogin?.employmentDate;
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const [birthdayLoading, setBirthdayLoading] = useState(false);

  console.log(user?.main?.userProfile.userLogin);

  const handleShowBirthday = asyncWrapper(async () => {
    try {
      setBirthdayLoading(true);

      const postData = {
        isActiveBirthday: showBirthday ? 1 : 0,
      };

      const res = await updatedProfile(postData);
      const { code, message } = res?.data;

      if (code === 0) {
        toast.success(message);
      }
    } finally {
      setBirthdayLoading(false);
    }
  }, toast);

  useEffect(() => {
    if (isActiveBirthdayJWT !== undefined && isActiveBirthdayJWT !== null) {
      setShowBirthday(isActiveBirthdayJWT === 1);
    }
  }, [isActiveBirthdayJWT]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="relative mb-16">
        <div className="h-48 w-full bg-gradient-to-r from-gray-900 to-bmw-border rounded-xl overflow-hidden relative">
          <img
            src={BackPMG}
            alt="Cover"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bmw-base to-transparent"></div>
        </div>
        <div className={`absolute -bottom-12 right-8 flex items-end gap-6`}>
          <CustomImage size={120} />
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
                <span className="text-sm">دفتر مرکزی تهران، طبقه</span>
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
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-bmw-border bg-bmw-hover/40 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs text-bmw-textSec">
                    {showBirthday
                      ? "تولد شما در ویجت متولدین این ماه نمایش داده می‌شود."
                      : "تولد شما برای سایر همکاران نمایش داده نخواهد شد."}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showBirthday}
                    onChange={(e) => setShowBirthday(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer transition-colors peer-checked:bg-bmw-blue"></div>
                  <div
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                      dir === "rtl"
                        ? "right-1 peer-checked:right-6"
                        : "left-1 peer-checked:left-6"
                    }`}
                  ></div>
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  loading={birthdayLoading}
                  onClick={handleShowBirthday}
                  variant="success"
                  label="تایید"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          {hasPermission("JobDescription.Create") && (
            <Button
              // onClick={handleShowAddNews}
              leftIcon={<Plus />}
              label="شرح کار"
              variant="success"
            />
          )}
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-bmw-text">
                {t("job_desc")}
              </h3>
              <span className="px-3 py-1 bg-green-900/10 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900 rounded text-xs">
                {t("active")}
              </span>
            </div>
            در حال تهیه و بررسی توسط واحد منابع انسانی است و به‌زودی در همین بخش
            به‌روزرسانی خواهد شد.
            {/* <div className="prose prose-invert max-w-none text-sm text-bmw-textSec space-y-4">
              <p>{data.desc}</p>
              <ul className="list-disc ps-5 space-y-1 opacity-80">
                {data.bullets.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div> */}
          </div>
          <div className="bg-bmw-surface border border-bmw-border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-bmw-text mb-4">
              {t("org_chart")}
            </h3>
            در حال تهیه و بررسی توسط واحد منابع انسانی است و به‌زودی در همین بخش
            به‌روزرسانی خواهد شد.
            {/* <div className="flex flex-col gap-4">
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
                  <p className="text-xs text-bmw-blue">{t("senior_manager")}</p>
                </div>
              </div>

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
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
