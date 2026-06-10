import React, { useEffect, useState } from "react";
import ModalUI from "../../components/UI/ModalUI";
import Button from "../../components/UI/Button";
import CustomInput from "../../components/UI/CustomInput";
import { Controller, useForm } from "react-hook-form";
import ComboBox from "../../components/UI/ComboBox";
import {
  addAttachment,
  createCompanyNews,
  getAllCategoryNews,
} from "../../services/dotNet";
import { useApi } from "../../hooks/useApi";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { useToast } from "../../hooks/useToast";
import { Upload, X } from "lucide-react";

const AddNews: React.FC<any> = ({
  showAddNews,
  setShowAddNews,
  handleGetAllNews,
  initialData,
  showEditNews,
}) => {
  const defaultFormValues = {
    title: "",
    content: "",
    isPinned: false,
  };
  const { control, handleSubmit, reset } = useForm<any>({
    defaultValues: defaultFormValues,
  });
  const [allCategory, setAllCategory] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...filesArray]);
    }
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = asyncWrapper(async (data: any) => {
    const fixCategories = selectedUser?.map((item) => item?.id);
    const postData = {
      title: data?.title,
      content: data?.content,
      isPinned: data?.isPinned || false,
      categoryIds: fixCategories,
    };
    const resCompanyNews = await createCompanyNews(postData);
    console.log(resCompanyNews);

    const { result, code, message } = resCompanyNews?.data;
    if (code === 0) {
      const formData = new FormData();
      console.log(formData);
      selectedImages.forEach((file) => {
        // const fixExt = file?.type?.split("/")?.[1];
        formData.append("FormFiles", file);
        // formData.append("Ext", fixExt);
      });
      formData.append("AttachmentId", resCompanyNews?.data?.result);
      formData.append("AttachmentType", "images/news");
      // formData.append("FileName", "ne");
      const resAttachment = await addAttachment(formData);
      console.log(resAttachment);
      const { code, result, message } = resAttachment?.data;
      setShowAddNews(false);
      handleGetAllNews();
      toast.success(message);
    }
  }, toast);

  useEffect(() => {
    if (!showAddNews) return;

    if (initialData?.id) {
      reset({
        title: initialData.title ?? "",
        content: initialData.content ?? "",
        isPinned: initialData.isPinned ?? false,
      });

      setSelectedUser(initialData.categories || []);
      setSelectedImages([]);
    } else {
      //   reset(defaultFormValues);
      //   setSelectedUser([]);
      //   setSelectedImages([]);
    }
  }, [showAddNews, initialData?.id, reset]);

  const handleGetAllCategory = asyncWrapper(async () => {
    const res = await getAllCategoryNews();
    const { code, result, message } = res?.data || {};
    if (code === 0) {
      setAllCategory(result);
    }
  }, toast);

  useEffect(() => {
    handleGetAllCategory();
  }, []);
  console.log("initialDatainitialDatainitialData", initialData);

  return (
    <ModalUI
      isOpen={showAddNews}
      onClose={() => setShowAddNews(false)}
      title={initialData ? "ویرایش خبر" : "افزودن خبر"}
      size="xl"
      closeOnBackdrop={false}
      footer={
        <>
          <Button
            onClick={() => setShowAddNews(false)}
            variant="outline-danger"
            label="لغو"
          />
          <Button
            onClick={handleSubmit(handleAdd)}
            variant="primary"
            label="تایید"
          />
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput
          label="تیتر"
          name="title"
          control={control}
          className="rounded-xl border border-gray-200 px-4 outline-none focus:border-bmw-blue"
        />
        <ComboBox
          label="دسته بندی"
          isMulti
          options={allCategory}
          keyId="id"
          keyValue="title"
          value={selectedUser}
          onChange={setSelectedUser}
        />

        <CustomInput
          isTextArea
          label="محتوا"
          rows={4}
          name="content"
          control={control}
          containerClassName="md:col-span-2"
          className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-bmw-blue"
        />
        <div className="flex justify-between md:col-span-2 w-full">
          <div className="">
            <label className="text-sm mb-2 block">افزودن عکس</label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-xl px-4 py-3 w-fit hover:bg-gray-50">
              <Upload size={18} />
              <span className="text-sm">Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Controller
              name="isPinned"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-bmw-blue"
                />
              )}
            />
            <label className="text-sm">پین شود</label>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div className="md:col-span-2 flex flex-wrap gap-4 mt-2">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-24 w-24 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-90 hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalUI>
  );
};

export default AddNews;
