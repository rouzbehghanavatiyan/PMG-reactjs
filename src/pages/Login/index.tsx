import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import ThemeAndLang from "../../common/ThemeAndLang";
import { usersLogin } from "../../services/dotNet";
import Button from "../../components/UI/Button";
import { useToast } from "../../hooks/useToast";
import ShowCapchaModal from "./ShowCapchaModal";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useApi } from "../../hooks/useApi";

const Login: React.FC<any> = () => {
  const { t } = useLanguage();
  const [loadingBtn, setLoadingBtn] = React.useState(false);
  const { control, handleSubmit } = useForm<any>();
  const toast = useToast();
  const [showCapchaModal, setShowCapchaModal] = useState(false);
  const [persoanlCode, setPersoanlCode] = useState("");
  const { call, loading } = useApi();

  const onSubmit = asyncWrapper(async (fields: any) => {
    setPersoanlCode(fields.personalCode);
    setLoadingBtn(true);
    const res = await usersLogin({ personalCode: fields.personalCode });
    const { code, message, data }: any = res?.data;
    if (code === 0) {
      if (data?.isSuccess) {
        setShowCapchaModal(true);
        toast.success(data?.message);
      } else {
        toast.warning(data?.message);
      }
    } else {
      toast.error(message);
    }
  }, toast);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-bmw-base flex items-center justify-center relative overflow-hidden transition-colors duration-300"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-10%]  bg-bmw-blue rounded-full blur-[150px] opacity-10"></div>
        </div>
        <div className="w-full max-w-md bg-bmw-surface border border-bmw-border rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/20">
          <ThemeAndLang />
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full from-blue-900 to-bmw-blue mb-4 border border-white/10">
              <span className="text-white font-bold text-xl">PK</span>
            </div>
            <h1 className="text-2xl font-bold text-bmw-text tracking-wide">
              Persia Khodro App
            </h1>
            <p className="text-bmw-textSec text-sm mt-2">
              {t("login_subtitle")}
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <CustomInput
                name="personalCode"
                className="w-full mt-2 bg-bmw-base border border-bmw-border text-bmw-text px-4 py-3 rounded-lg focus:outline-none focus:border-bmw-blue focus:ring-1 focus:ring-bmw-blue transition-all"
                control={control}
                label={t("employee_id")}
                numeric
                maxLength={6}
                placeholder="123456"
                rules={{
                  required: "کدپرسنلی الزامی است",
                  minLength: {
                    value: 5,
                    message: "کدپرسنلی باید حداقل 5 رقم باشد",
                  },
                }}
              />
            </div>
            <span className="flex justify-center">
              <Button
                type="submit"
                className="w-full"
                loading={loadingBtn}
                rightIcon={<ArrowRight size={18} className="rtl:rotate-180" />}
                variant="primary"
                label="ورود"
              />
            </span>
          </div>
          <div className="mt-8 pt-6 border-t border-bmw-border text-center">
            <div className="flex items-center justify-center gap-2 text-bmw-textSec text-xs">
              <ShieldCheck size={14} />
              <span>{t("auth_only")}</span>
            </div>
          </div>
        </div>
      </form>
      {showCapchaModal && (
        <ShowCapchaModal
          persoanlCode={persoanlCode}
          setPersoanlCode={setPersoanlCode}
          showCapchaModal={showCapchaModal}
          setShowCapchaModal={setShowCapchaModal}
        />
      )}
    </>
  );
};

export default Login;
