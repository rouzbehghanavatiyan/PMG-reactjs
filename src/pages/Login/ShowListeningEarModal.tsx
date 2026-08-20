import React from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { useForm } from "react-hook-form";
import { ArrowLeft, MessageCircleWarning, SendHorizontal } from "lucide-react";

const ShowListeningEarModal: React.FC<any> = ({
  showListeningEar,
  setShowListeningEar,
}) => {
  const { control, handleSubmit } = useForm<any>({
    defaultValues: {
      fullName: "",
      description: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("اطلاعات گوش شنوا:", data);
  };

  return (
    <ModalUI
      isOpen={showListeningEar}
      onClose={() => setShowListeningEar(false)}
      title="گوش شنوا"
      size="xl"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowListeningEar(false)}
            variant="outline-danger"
            label="انصراف"
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            rightIcon={<ArrowLeft size={16} />}
            variant="success"
            label="تایید و ارسال"
          />
        </> 
      }
    >
      <div className="space-y-4">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <CustomInput
              label="نام و نام خانوادگی (اختیاری)"
              name="fullName"
              control={control}
              className="bg rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
            />
          </div>

          <CustomInput
            label="توضیحات"
            isTextArea
            name="description"
            control={control}
            rules={{
              required: "وارد کردن توضیحات الزامی است",
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue min-h-[120px]"
          />
        </div>
      </div>
    </ModalUI>
  );
};

export default ShowListeningEarModal;
