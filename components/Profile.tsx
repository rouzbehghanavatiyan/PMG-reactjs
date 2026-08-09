import React, { useState, useEffect, useRef } from "react";
import BackPMG from "../src/assets/images/1024x192بنر پروفایل (3).jpg";
import {
  User,
  Upload,
  Sparkles,
  Image,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Lock,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";
import { ToastContainer } from "./Toast";
import ProfileInfo from "../src/pages/ProfileInfo";
import { useAppDispatch, useAppSelector } from "../src/features/store";
import {
  addAttachment,
  getUserProfile,
  updatedLimitUsedPhotoAi,
  updatedProfilePhoto,
} from "../src/services/dotNet";
import { jwtDecode } from "jwt-decode";
import { RsetUserProfile } from "../src/features/slices/mainSlice";
import StringHelpers from "../src/utils/stringHelpers";
import CustomImage from "../src/components/UI/CustomImage";
const baseURL = "http://172.16.10.15:3001";

const SHAWL_COLORS = [
  {
    id: "royal-blue",
    nameFa: "آبی کاربنی (Persia Khodro / BMW)",
    nameEn: "Royal Blue (Persia Khodro / BMW)",
    descFa: "رنگ آبی کاربنی رسمی پرشیاخودرو و بیام‌و",
    descEn: "Official Persia Khodro & BMW Royal Blue",
    colorPrompt: "royal blue (آبی کاربنی)",
  },
  {
    id: "charcoal-black",
    nameFa: "مشکی زغالی (Persia Khodro)",
    nameEn: "Charcoal Black (Persia Khodro)",
    descFa: "مشکی متالیک لوکس و سنگین",
    descEn: "Luxury Metallic Charcoal Black",
    colorPrompt: "charcoal black / metallic black",
  },
  {
    id: "m-light-blue",
    nameFa: "آبی روشن ام (BMW M)",
    nameEn: "BMW M Light Blue",
    descFa: "آبی آسمانی اسپرت سری M بیام‌و",
    descEn: "BMW M Series Sky Blue",
    colorPrompt: "sky blue / BMW M light blue",
  },
  {
    id: "m-dark-blue",
    nameFa: "آبی تیره ام (BMW M)",
    nameEn: "BMW M Dark Blue",
    descFa: "آبی تیره اسپرت و کلاسیک سری M",
    descEn: "BMW M Series Dark Navy Blue",
    colorPrompt: "dark navy blue / BMW M dark blue",
  },
  {
    id: "m-red",
    nameFa: "قرمز ام (BMW M)",
    nameEn: "BMW M Red",
    descFa: "قرمز مسابقه‌ای تهاجمی سری M",
    descEn: "BMW M Series Racing Red",
    colorPrompt: "bright fire-engine red / BMW M red",
  },
  {
    id: "mini-green",
    nameFa: "سبز ریسینگ مینی (MINI)",
    nameEn: "MINI British Racing Green",
    descFa: "سبز اصیل مسابقات بریتانیا برند مینی",
    descEn: "Classic British Racing Green",
    colorPrompt: "deep British racing green / forest green",
  },
  {
    id: "opel-yellow",
    nameFa: "زرد رسمی اوپل (Opel)",
    nameEn: "Opel Yellow",
    descFa: "زرد زنده و پرانرژی سازمانی اوپل",
    descEn: "Vibrant Opel Yellow",
    colorPrompt: "vibrant cadmium yellow",
  },
  {
    id: "nissan-red",
    nameFa: "قرمز نیسان (NISSAN)",
    nameEn: "Nissan Red",
    descFa: "قرمز متالیک رسمی و نمادین نیسان",
    descEn: "Official Nissan Metallic Red",
    colorPrompt: "cherry red / metallic dark red",
  },
  {
    id: "titanium-silver",
    nameFa: "نقره‌ای تیتانیوم (BMW)",
    nameEn: "Titanium Silver (BMW)",
    descFa: "نقره‌ای متالیک لوکس و مدرن بیام‌و",
    descEn: "Luxury Titanium Silver Metallic",
    colorPrompt: "titanium silver / cool metallic gray",
  },
  {
    id: "alpine-white",
    nameFa: "سفید آلپاین (BMW)",
    nameEn: "Alpine White (BMW)",
    descFa: "سفید براق و پرستیژ آلپاین بیام‌و",
    descEn: "Glossy Alpine White",
    colorPrompt: "alpine white / bright off-white",
  },
  {
    id: "champagne-gold",
    nameFa: "بژ متالیک شامپاینی (MINI/BMW)",
    nameEn: "Champagne Metallic (MINI/BMW)",
    descFa: "بژ متالیک شامپاینی کلاسیک و مجلل",
    descEn: "Warm Champagne Gold Metallic",
    colorPrompt: "champagne gold / soft warm metallic beige",
  },
  {
    id: "dark-gray",
    nameFa: "خاکستری متالیک (Persia Khodro)",
    nameEn: "Dark Gray Metallic (Persia Khodro)",
    descFa: "خاکستری تیره متالیک رسمی",
    descEn: "Official Dark Metallic Gray",
    colorPrompt: "dark mineral gray / gunmetal",
  },
];

const stepsFa = [
  "درحال تحلیل ساختار چهره و شناسایی نقاط بیومتریک...",
  "حذف پس‌زمینه و هماهنگ‌سازی با استاندارد یکنواخت سفید...",
  "اعمال نورپردازی آتلیه‌ای سافت‌باکس و تنظیم تراز سفیدی...",
  "بازسازی و شبیه‌سازی لباس رسمی پرسنلی...",
  "تولید تصویر ۳:۴ نهایی با کیفیت فوق‌العاده...",
];

const stepsEn = [
  "Analyzing facial structure and identifying biometric keypoints...",
  "Removing background and aligning with uniform white standard...",
  "Applying studio softbox lighting and white balance tuning...",
  "Reconstructing and simulating official formal clothing...",
  "Generating final high-resolution 3:4 passport image...",
];

const Profile: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"info" | "passport_photo">("info");

  const user = useAppSelector((state) => state);
  const firstName = user?.main?.userProfile?.userLogin?.firstName;
  const personalCode = user?.main?.userProfile?.userLogin?.personalCode;
  const lastName = user?.main?.userProfile?.userLogin?.lastName;
  console.log(user?.main?.userProfile?.userLogin?.profileAttachment);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const userProfile = user?.main?.userProfile?.userLogin;
  const aiPhotoUsed = user?.main?.userProfile?.userLogin?.aiPhotoUsed;
  const dispatch = useAppDispatch();
  const [shawlColor, setShawlColor] = useState<string>("royal-blue");
  const [selectedModel, setSelectedModel] =
    useState<string>("gemini-3-pro-image");
  const department = user?.main?.userProfile?.userLogin?.department;
  const isMan = user?.main?.userProfile?.userLogin?.gender === "مرد";
  const isWomen = user?.main?.userProfile?.userLogin?.gender === "زن";
  console.log(userProfile, aiPhotoUsed);
  const [toasts, setToasts] = useState<any[]>([]);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [gender, setGender] = useState<"مرد" | "زن">("مرد");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [maskMode, setMaskMode] = useState<"strict" | "full">("strict");
  const [ovalX, setOvalX] = useState<number>(50);
  const [ovalY, setOvalY] = useState<number>(42);
  const [ovalSize, setOvalSize] = useState<number>(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhoto =
    avatarUrl ||
    (user?.main?.userProfile?.userLogin?.profileAttachment &&
      StringHelpers.getImage(
        user?.main?.userProfile?.userLogin?.profileAttachment,
      ));

  const addToast = (
    type: "success" | "error" | "info" | "loading",
    title: string,
    message: string,
    duration = 4500,
  ) => {
    const newToast: any = {
      id: Date.now().toString(),
      type,
      title,
      message,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // const fetchRemoteProfile = async () => {
  //   try {
  //     const res = await fetch(`${baseURL}/api/user/profile/default_user`);
  //     const data = await res.json();
  //     console.log("hello res", data);
  //     if (data.success && data.profile) {
  //       if (data.profile.avatar_url) {
  //         // localStorage.setItem("user_avatar", data?.profile?.avatar_url);
  //         setAvatarUrl(data.profile.avatar_url);
  //       }

  //       if (data.profile.ai_passport_photo_used !== undefined) {
  //         // setAiPhotoUsed(data.profile.ai_passport_photo_used ? 1 : 0);
  //       }
  //     }
  //   } catch (err) {
  //     console.warn("Could not fetch profile from remote Postgres DB:", err);
  //   }
  // };

  useEffect(() => {
    // fetchRemoteProfile();

    const handleAvatarChange = () => {
      // setAvatarUrl(localStorage.getItem("user_avatar") || "/assets/avatar.svg");
    };
    window.addEventListener("avatarChanged", handleAvatarChange);
    return () => {
      window.removeEventListener("avatarChanged", handleAvatarChange);
    };
  }, []);

  const handleRefreshUser = async () => {
    try {
      const token: any = localStorage.getItem("token");
      const decoded: any = jwtDecode(token);

      const res = await getUserProfile();
      const { code, result }: any = res?.data;
      if (code === 0) {
        dispatch(RsetUserProfile({ token: decoded, userLogin: result }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (activeTab === "passport_photo") {
      handleRefreshUser();
    }
  }, [activeTab]);

  console.log(selectedModel);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(
          language === "fa"
            ? "حجم فایل انتخاب شده نباید بیشتر از ۱۰ مگابایت باشد."
            : "File size should not exceed 10MB.",
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        setGeneratedImage(null);
        setErrorMsg(null);
        setSuccessMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeSourceImage = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;

    const res = await getUserProfile();
    const { code, result }: any = res?.data;
    if (code === 0 && !result?.aiPhotoUsed) {
      if (aiPhotoUsed) {
        const msg =
          language === "fa"
            ? "سقف مجاز ساخت تصویر پرسنلی برای شما به پایان رسیده است (۱/۱ استفاده شده). امکان ارسال درخواست جدید وجود ندارد."
            : "Your 1-time AI passport photo limit has been used (1/1). You cannot send a new request.";
        setErrorMsg(msg);
        addToast(
          "error",
          language === "fa" ? "سقف مجاز تکمیل شده" : "Limit Exceeded",
          msg,
        );
        return;
      }

      setIsGenerating(true);
      setGeneratedImage(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      setProgressPercentage(5);
      const createMask = (src: string): Promise<string> => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width || 512;
            canvas.height = img.height || 512;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (maskMode === "strict") {
                ctx.fillStyle = "#FFFFFF";
                ctx.beginPath();
                const centerX = canvas.width * (ovalX / 100);
                const centerY = canvas.height * (ovalY / 100);
                const radiusX = canvas.width * (ovalSize / 100) * 0.225;
                const radiusY = canvas.height * (ovalSize / 100) * 0.275;
                ctx.ellipse(
                  centerX,
                  centerY,
                  radiusX,
                  radiusY,
                  0,
                  0,
                  2 * Math.PI,
                );
                ctx.fill();
              }
            }
            resolve(canvas.toDataURL("image/png"));
          };
          img.onerror = () => {
            resolve(
              "data:image/png;base64,iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            );
          };
          img.src = src;
        });
      };

      const basePrompt = `You are an elite professional biometric passport photographer and facial reconstruction specialist.
TASK

Using ONLY the uploaded face photo as the absolute identity reference, generate one ultra-high-quality biometric passport-style ID photo.

════════════════════════════
CRITICAL FACIAL FIDELITY MANDATE (EXTREMELY IMPORTANT)
════════════════════════════

- Maintain 100% pixel-perfect likeness, facial anatomy, and exact proportions of the original user's face.
- Retain all delicate unique facial micro-details: the precise shape, size, color, and symmetry of the eyes, unique eyelids, shape of the nose bridge and nostrils, precise curvature and volume of the lips, jawline contours, ear placement, cheekbones, birthmarks, freckles, skin pores, and natural skin texture.
- Absolutely NO modification of facial features, NO facial morphing, NO generic AI face-swapping, and NO stylized cartoonish or airbrushed/plastic/smooth filtering.
- The face in the output MUST be 100% identical, immediately recognizable, and exactly the same person as in the reference image without any deviation. Every millimeter of the facial geometry, skin tones, and texture must match the original.

════════════════════════════
IDENTITY (HIGHEST PRIORITY)
════════════════════════════

The uploaded image is the ONLY identity reference.

Preserve the person's identity EXACTLY.

Do NOT change:
- Face shape or proportions
- Eyes, eyebrows, nose, lips, ears
- Jawline or forehead
- Skin tone
- Hairline
- Age
- Gender
- Ethnicity
- Facial expression identity

Do NOT beautify, retouch, reshape, de-age, apply makeup, smooth skin, change hairstyle, hair color, eye color, or facial hair.

The final image must clearly look like the same real person.

════════════════════════════
PASSPORT PHOTO
════════════════════════════

Generate a standard biometric passport photo.

- Vertical 3:4 aspect ratio
- Head centered
- Looking directly at the camera
- Neutral expression
- Mouth closed
- Eyes open
- Head occupies about 70–80% of the frame
- Head and upper shoulders visible
- Correct passport crop

════════════════════════════
BACKGROUND & LIGHTING
════════════════════════════

Background:
- Pure white (#FFFFFF)
- Uniform
- No shadows
- No texture
- No objects

Lighting:
- Professional studio lighting
- Soft and even
- Natural skin tones
- Neutral white balance
- Sharp focus

════════════════════════════
CLOTHING & DRESS PRESERVATION (EXTREMELY CRITICAL)
════════════════════════════

 FIRST, analyze the original clothing of the person in the uploaded image.
- IF THE PERSON IS ALREADY WEARING FORMAL CLOTHING (such as a suit jacket/blazer, collared shirt, necktie, bowtie, or formal office wear), you MUST PRESERVE those clothing details exactly as they are. Keep the exact colors, textures, patterns, necktie knots, collars, lapels, buttons, and folds from the original photo. Do not replace them or replace a suit/tie with a different outfit.
- ONLY IF the original clothing is casual or unsuitable (e.g., hoodies, t-shirts, sportswear, pajamas), you should replace them with high-quality, professional formal business clothing as specified below.`;

      const maleClothing = `

Male Clothing Rules:
1. Preserve Original Formal Attire: If the original photo already features a suit jacket, blazer, shirt, or tie, preserve these items exactly without alteration.
2. If replacement is needed: Generate a highly realistic professional dark business suit jacket (charcoal black or dark navy blue), a crisp white collared dress shirt, and a clean, elegant, tasteful solid-colored or striped necktie. It must look completely natural and perfectly fitted around the neck and shoulders.`;

      const activeColorObj =
        SHAWL_COLORS.find((c) => c.id === shawlColor) || SHAWL_COLORS[0];
      const colorPromptStr = activeColorObj.colorPrompt;
      const colorNameFa = activeColorObj.nameFa;

      const femaleClothing = `

Female Clothing & Shawl Rules:
1. Shawl Requirement: Wear a modern, elegant ${colorPromptStr} shawl (${colorNameFa}) made of soft, light, flowing premium georgette/chiffon fabric.
2. Shawl Draping Style: The shawl must wrap smoothly and neatly around the head, framing the face beautifully, and drape gracefully over the shoulders and chest exactly like a modern draped hijab shawl (as in the provided example). This must NOT look like a stiff, rigid Iranian maqna'eh, NOT look like a hood, and NOT look like a rigid cowl. One side of the shawl should drape down naturally over the front shoulder.
3. Preserve Under-wear/Suit: If the original photo already features a formal blazer, dress, or jacket, keep that clothing visible under the neatly draped ${colorPromptStr} shawl. If the original clothing was casual, generate a professional elegant dark business suit jacket/blazer or neat high-collar formal blouse underneath the shawl.
4. Hair & Neck: Hair, neck, and ears must be fully covered by the shawl.
5. Solid Color: Solid ${colorPromptStr} color, with no patterns, decorations, or logos.
6. Do NOT alter any facial proportions while adding the modern ${colorPromptStr} shawl (${colorNameFa}).`;

      const tailPrompt = `
No hats, sunglasses or unnecessary accessories.

════════════════════════════
QUALITY
════════════════════════════

Produce an ultra-photorealistic studio-quality passport photo.

- DSLR-quality
- Natural skin texture
- High resolution
- Extremely sharp
- No AI artifacts
- No illustration
- No beauty filters

════════════════════════════
FINAL OUTPUT
════════════════════════════

Generate ONE high-resolution biometric passport photo suitable for official identification documents while preserving the person's identity exactly.`;

      const fullPrompt =
        basePrompt + (isMan ? maleClothing : femaleClothing) + tailPrompt;

      const steps = language === "fa" ? stepsFa : stepsEn;
      let stepIdx = 0;
      setProgressStep(steps[0]);

      const interval = setInterval(() => {
        setProgressPercentage((prev) => {
          if (prev < 90) {
            const nextPercent = prev + Math.floor(Math.random() * 8) + 2;
            const currentStepIdx = Math.min(
              Math.floor(nextPercent / 20),
              steps.length - 1,
            );
            setProgressStep(steps[currentStepIdx]);
            return nextPercent;
          }
          return prev;
        });
      }, 1200);
      try {
        const maskData = await createMask(sourceImage);
        const response = await fetch(`${baseURL}/api/images/edits`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: sourceImage,
            mask: maskData,
            prompt: fullPrompt,
            model: selectedModel,
            userId: personalCode,
          }),
        });
        clearInterval(interval);
        if (response.ok) {
          const postData = {
            personalCode: personalCode,
            aiPhotoUsed: 1,
          };
          const updateUsedPhoto = await updatedLimitUsedPhotoAi(postData);
          console.log("updateUsedPhoto", updateUsedPhoto);
        } else {
          const errData = await response.json();
          throw new Error(errData.error || "Server returned an error");
        }

        const data = await response.json();
        const imgData = data?.data?.[0];

        if (imgData) {
          const resultUrl = imgData.b64_json
            ? `data:image/png;base64,${imgData.b64_json}`
            : imgData.url;

          setProgressPercentage(100);
          setGeneratedImage(resultUrl);
          // setAiPhotoUsed(true);
          setSuccessMsg(
            language === "fa"
              ? "تصویر پرسنلی شما با موفقیت تولید شد! سقف مجاز تک‌بار شما مصرف گردید."
              : "Your passport photo was successfully generated! Your 1-time quota has been used.",
          );
          addToast(
            "info",
            language === "fa" ? "ثبت سقف مجاز" : "Quota Used",
            language === "fa"
              ? "درخواست با موفقیت ثبت شد. فیلد سقف مجاز کاربر به ۱ (غیرفعال) تغییر یافت."
              : "Request completed. User photo quota updated to 1.",
          );
        } else {
          throw new Error("No image data returned from API.");
        }
      } catch (err: any) {
        clearInterval(interval);
        setErrorMsg(
          err.message ||
            (language === "fa"
              ? "برقراری ارتباط با سرویس هوش مصنوعی با خطا مواجه شد."
              : "Failed to communicate with AI service."),
        );
      } finally {
        setIsGenerating(false);
      }
    } else {
      addToast(
        "error",
        language === "fa" ? "خطا" : "Error",
        language === "fa"
          ? "سقف مجاز ساخت تصویر پرسنلی هوشمند برای شما به پایان رسیده است (محدودیت ۱ بار). امکان درخواست جدید وجود ندارد."
          : "Your smart personnel image generation limit has been reached (limit: 1 time). You cannot submit a new request.",
      );
    }
  };

  const handleCreateBase64ToFile = async (base64String: string) => {
    const arr = base64String.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";

    const byteString = atob(arr[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    const extension = mime.split("/")[1] || "png";
    const fileName = `${personalCode}.${extension}`;

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mime });
  };

  const handleApplyAsProfile = async () => {
    if (!generatedImage) return;
    localStorage.setItem("user_avatar", generatedImage);
    setAvatarUrl(generatedImage);
    window.dispatchEvent(new Event("avatarChanged"));
    setIsSavingToDb(true);
    // addToast(
    //   "loading",
    //   language === "fa" ? "ذخیره در دیتابیس" : "Database Upload",
    //   language === "fa"
    //     ? "درحال آپلود و ذخیره‌سازی تصویر در دیتابیس ریموت PostgreSQL..."
    //     : "Uploading and saving profile image to remote PostgreSQL DB...",
    // );
    try {
      const formData = new FormData();
      const file = await handleCreateBase64ToFile(generatedImage);
      formData.append("FormFiles", file);
      formData.append("AttachmentType", "picPersonal");
      const resAttachment = await addAttachment(formData);
      console.log("resAttachment resAttachment", resAttachment);
      const postData = {
        profileAttachmentId: resAttachment?.data?.result?.[0]?.attachmentId,
      };
      const resAttachmentProfile = await updatedProfilePhoto(postData);
      console.log(
        "resAttachmentProfileresAttachmentProfileresAttachmentProfileresAttachmentProfile",
        resAttachmentProfile,
      );

      if (resAttachment?.data?.code === 0) {
        setIsSavingToDb(false);
        addToast(
          "success",
          language === "fa" ? "پایگاه داده ریموت" : "Remote Database",
          language === "fa"
            ? "تصویر پروفایل جدید با موفقیت آپلود شد و در دیتابیس ریموت PostgreSQL قرار گرفت!"
            : "New profile image was successfully uploaded and saved to the remote PostgreSQL database!",
        );
        setSuccessMsg(
          language === "fa"
            ? "تصویر پروفایل شما با موفقیت به‌روزرسانی شد و در پایگاه داده Postgres ذخیره گردید!"
            : "Your profile picture was successfully updated and saved in the remote Postgres DB!",
        );
      } else {
        addToast(
          "info",
          language === "fa" ? "حافظه محلی" : "Local Storage",
          language === "fa"
            ? "تصویر به صورت محلی به‌روزرسانی شد."
            : "Image updated locally.",
        );
        setSuccessMsg(
          language === "fa"
            ? "تصویر پروفایل شما با موفقیت به صورت محلی به‌روزرسانی شد!"
            : "Your profile picture was successfully updated locally!",
        );
      }
    } catch (err) {
      console.error("Error saving avatar to Postgres DB:", err);
      // addToast(
      //   "error",
      //   language === "fa" ? "خطا در دیتابیس" : "Database Error",
      //   language === "fa"
      //     ? "اتصال به دیتابیس ریموت برقرار نشد، اما تصویر به صورت محلی ذخیره شد."
      //     : "Could not connect to remote DB, saved locally.",
      // );
      setSuccessMsg(
        language === "fa"
          ? "تصویر پروفایل شما با موفقیت به صورت محلی به‌روزرسانی شد!"
          : "Your profile picture was successfully updated locally!",
      );
    } finally {
      setIsSavingToDb(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    try {
      if (generatedImage.startsWith("data:")) {
        // Convert base64 data URL to a blob to avoid browser memory crash in iframe
        const parts = generatedImage.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `biometric_passport_photo_${gender}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `biometric_passport_photo_${gender}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Error downloading image:", e);
      // Fallback: open in new tab
      window.open(generatedImage, "_blank");
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        dir={dir}
      />

      <div className="relative mb-16">
        <div className="h-48 w-full bg-gradient-to-r from-gray-900 to-bmw-border rounded-xl overflow-hidden relative">
          <img
            src={BackPMG}
            alt="Cover"
            className="w-full h-full object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-bmw-base to-transparent"></div>
        </div>
        <div
          className={`absolute -bottom-12 ${dir === "rtl" ? "right-8" : "left-8"} flex items-end gap-6`}
        >
          {/* <div className="w-32 h-32 rounded-full border border-bmw-base bg-bmw-surface overflow-hidden shadow-2xl relative group"> */}
          <CustomImage src={profilePhoto} size={120} />
          {/* 
            {(isGenerating || isSavingToDb) && (
              <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center p-2 text-white z-20 animate-fade-in text-center rounded-full">
                <div className="relative flex items-center justify-center mb-1">
                  <div className="absolute w-12 h-12 rounded-full border-2 border-bmw-blue/50 animate-ping" />
                  <RefreshCw className="w-7 h-7 text-bmw-blue animate-spin shrink-0 drop-shadow-[0_0_8px_rgba(0,102,177,0.8)]" />
                </div>
                <span className="text-[10px] font-bold text-blue-200 leading-tight px-1">
                  {isSavingToDb
                    ? language === "fa"
                      ? "ذخیره دیتابیس..."
                      : "Saving DB..."
                    : language === "fa"
                      ? "پردازش تصویر..."
                      : "Processing..."}
                </span>
              </div>
            )}
          </div> */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-bmw-text">
              {firstName} {lastName}
            </h1>
            <p className="text-bmw-blue font-medium">{department}</p>
          </div>
        </div>
        {/* <div
          className={`absolute bottom-4 ${dir === "rtl" ? "left-4" : "right-4"} flex items-center gap-3`}
        >
          <button
            onClick={() => setActiveTab("passport_photo")}
            className="bg-bmw-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-black/20"
          >
            <Sparkles size={16} />
            {language === "fa"
              ? "تغییر تصویر با هوش مصنوعی"
              : "Change Profile with AI"}
          </button>
        </div> */}
      </div>
      <div className="flex border-b border-bmw-border/80 gap-6">
        <button
          onClick={() => {
            setActiveTab("info");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === "info"
              ? "text-bmw-blue"
              : "text-bmw-textSec hover:text-bmw-text"
          }`}
        >
          {language === "fa" ? "اطلاعات پرسنلی" : "Personal Information"}
          {activeTab === "info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bmw-blue animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("passport_photo");
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`pb-4 text-sm font-semibold transition-all relative flex items-center gap-2 ${
            activeTab === "passport_photo"
              ? "text-bmw-blue"
              : "text-bmw-textSec hover:text-bmw-text"
          }`}
        >
          <Sparkles
            size={16}
            className={
              activeTab === "passport_photo"
                ? "text-bmw-blue animate-pulse"
                : ""
            }
          />
          {language === "fa"
            ? "ساخت تصویر پرسنلی هوشمند (AI)"
            : "AI Passport Photo Studio"}
          {activeTab === "passport_photo" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bmw-blue animate-fade-in" />
          )}
        </button>
      </div>
      {activeTab === "info" ? (
        <ProfileInfo />
      ) : (
        <div className="grid grid-cols-12 gap-8 items-start animate-fade-in text-bmw-text">
          <div className="lg:col-span-7 col-span-12 bg-bmw-surface border border-bmw-border rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 border-b border-bmw-border pb-3">
                <Sparkles className="w-5 h-5 text-bmw-blue" />
                {language === "fa"
                  ? "آتلیه هوشمند عکس پرسنلی"
                  : "Smart AI Passport Photo Studio"}
              </h3>
              <p className="text-xs text-bmw-textSec mt-2 leading-relaxed">
                {language === "fa"
                  ? "این ابزار با استفاده از مدل تخصصی Gemini 3 Pro (Banana Pro) چهره شما را پردازش کرده و یک عکس پرسنلی بیومتریک استاندارد با پس‌زمینه سفید، نورپردازی آتلیه‌ای و لباس رسمی تولید می‌کند."
                  : "This tool uses the specialized Gemini 3 Pro (Banana Pro) model to process your face and generate a standard biometric passport photo with a clean white background, professional studio lighting, and formal clothing."}{" "}
              </p>
            </div>

            {aiPhotoUsed && (
              <div className="p-4 bg-rose-500/10 text-rose-300 border-2 border-rose-500/30 rounded-xl text-xs flex gap-3 items-start animate-fade-in shadow-lg shadow-rose-950/20">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-200">
                    {language === "fa"
                      ? "سقف ۱ بار ساخت تصویر پرسنلی تکمیل شده است"
                      : "AI Photo Limit Reached (1/1 Used)"}
                  </h4>
                  <p className="leading-relaxed opacity-90">
                    {language === "fa"
                      ? "هر کاربر به صورت خودکار فقط یک بار مجاز به ارسال درخواست است. فیلد مربوطه در پروفایل شما برابر با ۱ (غیرفعال) می‌باشد. تنها مدیر سیستم (Admin) می‌تواند دسترسی شما را مجدداً فعال نماید."
                      : "Each user can generate an AI photo only once. Your account status is set to 1 (Disabled). Only system Admin can re-enable this access."}
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs flex gap-2 items-start animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs flex gap-2 items-start animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-2">
                  {language === "fa"
                    ? "انتخاب جنسیت پرسنل (جهت انتخاب خودکار لباس رسمی)"
                    : "Select Gender (for auto-formal clothing selection)"}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={isWomen}
                    onClick={() => setGender("زن")}
                    className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isWomen
                        ? "opacity-40 cursor-not-allowed bg-bmw-hover border-bmw-border text-bmw-textSec/50" // استایل حالت غیرفعال
                        : isMan
                          ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-md"
                          : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {language === "fa"
                      ? "آقا (پیراهن یقه‌دار و لباس رسمی)"
                      : "Male (Collared Shirt/Suit)"}
                  </button>

                  <button
                    type="button"
                    disabled={isMan}
                    onClick={() => setGender("زن")}
                    className={`p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      isMan
                        ? "opacity-40 cursor-not-allowed bg-bmw-hover border-bmw-border text-bmw-textSec/50" // استایل حالت غیرفعال
                        : isWomen
                          ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-md"
                          : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {language === "fa"
                      ? `خانم (${SHAWL_COLORS.find((c) => c.id === shawlColor)?.nameFa.split(" (")[0] || "شال مدرن"})`
                      : `Female (${SHAWL_COLORS.find((c) => c.id === shawlColor)?.nameEn.split(" (")[0] || "Modern Shawl"})`}
                  </button>
                </div>
              </div>
              {isWomen && (
                <div className="p-4 bg-bmw-hover/40 border border-bmw-border/50 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider">
                      {language === "fa"
                        ? "رنگ شال سازمانی (پرشیاخودرو / BMW / MINI / Opel / NISSAN)"
                        : "Organizational Shawl Color (Persia Khodro / BMW / MINI / Opel / NISSAN)"}
                    </label>
                    <span className="text-[10px] bg-bmw-blue/15 text-bmw-blue px-2 py-0.5 rounded-full font-semibold">
                      {language === "fa" ? "انتخابی خانم‌ها" : "For Females"}
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={shawlColor}
                      onChange={(e) => setShawlColor(e.target.value)}
                      className="w-full bg-bmw-surface border border-bmw-border hover:border-bmw-blue/50 text-bmw-text rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bmw-blue/30 transition-all cursor-pointer appearance-none pr-10"
                      dir={dir}
                    >
                      {SHAWL_COLORS.map((color) => (
                        <option
                          key={color.id}
                          value={color.id}
                          className="bg-bmw-surface text-bmw-text"
                        >
                          {language === "fa" ? color.nameFa : color.nameEn}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute inset-y-0 ${dir === "rtl" ? "left-3" : "right-3"} flex items-center pointer-events-none text-bmw-textSec`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Brand Highlight Banner */}
                  {(() => {
                    const activeColor =
                      SHAWL_COLORS.find((c) => c.id === shawlColor) ||
                      SHAWL_COLORS[0];
                    let brandLabel = "";
                    let badgeClass = "";
                    if (
                      activeColor.id.includes("m-") ||
                      activeColor.id.includes("alpine") ||
                      activeColor.id.includes("titanium")
                    ) {
                      brandLabel = "BMW";
                      badgeClass =
                        "bg-blue-600/15 text-blue-400 border border-blue-500/25";
                    } else if (activeColor.id.includes("mini")) {
                      brandLabel = "MINI";
                      badgeClass =
                        "bg-emerald-600/15 text-emerald-400 border border-emerald-500/25";
                    } else if (activeColor.id.includes("opel")) {
                      brandLabel = "Opel";
                      badgeClass =
                        "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25";
                    } else if (activeColor.id.includes("nissan")) {
                      brandLabel = "NISSAN";
                      badgeClass =
                        "bg-red-600/15 text-red-400 border border-red-500/25";
                    } else {
                      brandLabel = "Persia Khodro";
                      badgeClass =
                        "bg-amber-500/15 text-amber-400 border border-amber-500/25";
                    }

                    return (
                      <div className="flex items-center gap-3 p-3 bg-bmw-surface/50 rounded-lg border border-bmw-border/30 text-xs">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-inner"
                          style={{
                            backgroundColor:
                              activeColor.id === "royal-blue"
                                ? "#0033CC"
                                : activeColor.id === "charcoal-black"
                                  ? "#1C1C1C"
                                  : activeColor.id === "m-light-blue"
                                    ? "#5EACE0"
                                    : activeColor.id === "m-dark-blue"
                                      ? "#112255"
                                      : activeColor.id === "m-red"
                                        ? "#E11D48"
                                        : activeColor.id === "mini-green"
                                          ? "#004F30"
                                          : activeColor.id === "opel-yellow"
                                            ? "#FACC15"
                                            : activeColor.id === "nissan-red"
                                              ? "#DC2626"
                                              : activeColor.id ===
                                                  "titanium-silver"
                                                ? "#A1A1AA"
                                                : activeColor.id ===
                                                    "alpine-white"
                                                  ? "#F4F4F5"
                                                  : activeColor.id ===
                                                      "champagne-gold"
                                                    ? "#D97706"
                                                    : "#4B5563",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-bmw-text text-xs">
                              {language === "fa"
                                ? activeColor.nameFa.split(" (")[0]
                                : activeColor.nameEn.split(" (")[0]}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${badgeClass}`}
                            >
                              {brandLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-bmw-textSec mt-0.5 leading-normal">
                            {language === "fa"
                              ? activeColor.descFa
                              : activeColor.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-2">
                  {language === "fa"
                    ? "مدل هوش مصنوعی مولد تصویر"
                    : "AI Image Generation Model"}
                </label>
                <div className="grid grid-cols-12 lg:grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("gemini-3-pro-image");
                    }}
                    className={`p-3 rounded-xl col-span-12 lg:col-span-4 border text-left transition-all flex flex-col gap-1 relative overflow-hidden ${
                      selectedModel === "gemini-3-pro-image"
                        ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-md"
                        : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>Gemini 3 Pro</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                        {language === "fa" ? "فعال" : "Active"}
                      </span>
                    </div>
                    <span className="text-[10px] text-bmw-textSec leading-normal mt-1">
                      {language === "fa"
                        ? "پیشرفته‌ترین مدل تولید تصویر با رند فوق‌العاده جزئیات چهره"
                        : "Ultra-advanced image generation with precise face details"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModel("gemini-3.1-flash-image")}
                    className={`p-3 rounded-xl  col-span-12 lg:col-span-4 border text-left transition-all flex flex-col gap-1 relative overflow-hidden ${
                      selectedModel === "gemini-3.1-flash-image"
                        ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-md"
                        : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                        <span>Gemini 3.1 Flash</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                        {language === "fa" ? "فعال" : "Active"}
                      </span>
                    </div>
                    <span className="text-[10px] text-bmw-textSec leading-normal mt-1">
                      {language === "fa"
                        ? "سرعت بالا، نورپردازی عالی، پایبندی به پرامپت با جستجوی هوشمند تصویر"
                        : "Fast and smart model with advanced lighting"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedModel("gemini-3.1-flash-lite-image")
                    }
                    className={`p-3 rounded-xl col-span-12 lg:col-span-4 border text-left transition-all flex flex-col gap-1 relative overflow-hidden ${
                      selectedModel === "gemini-3.1-flash-lite-image"
                        ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-md"
                        : "bg-bmw-hover border-bmw-border text-bmw-textSec hover:text-bmw-text"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                        <span>Gemini 3.1 Lite</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                        {language === "fa" ? "فعال" : "Active"}
                      </span>
                    </div>
                    <span className="text-[10px] text-bmw-textSec leading-normal mt-1">
                      {language === "fa"
                        ? "مدل بلادرنگ و سریع با هزینه محاسباتی بسیار کم و کیفیت عالی"
                        : "Real-time ultra-fast and lightweight model"}
                    </span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-bmw-textSec uppercase tracking-wider mb-2">
                  {language === "fa"
                    ? "بارگذاری تصویر چهره مرجع"
                    : "Upload Source Face Photo"}
                </label>

                {!sourceImage ? (
                  <div
                    onClick={triggerFileSelect}
                    className="border-2 border-dashed border-bmw-border hover:border-bmw-blue bg-bmw-hover/50 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:bg-bmw-hover"
                  >
                    <div className="w-12 h-12 rounded-full bg-bmw-blue/10 flex items-center justify-center text-bmw-blue">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold">
                        {language === "fa"
                          ? "کلیک کنید یا تصویر خود را اینجا رها کنید"
                          : "Click or drag photo here"}
                      </p>
                      <p className="text-xs text-bmw-textSec">
                        {language === "fa"
                          ? "فایل‌های تصویری با فرمت JPEG یا PNG (حداکثر ۱۰ مگابایت)"
                          : "JPEG or PNG formats (Max size: 10MB)"}
                      </p>
                    </div>
                    <div className="bg-bmw-input border border-bmw-border px-3 py-1.5 rounded-lg text-xs font-medium text-bmw-textSec hover:text-bmw-text transition-colors">
                      {language === "fa" ? "انتخاب عکس" : "Browse File"}
                    </div>
                  </div>
                ) : (
                  <div className="bg-bmw-hover border border-bmw-border rounded-xl p-4 flex items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 rounded-lg overflow-hidden border border-bmw-border/80 bg-bmw-input relative shrink-0">
                        <img
                          src={sourceImage}
                          alt="Source"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-bmw-text">
                          {language === "fa"
                            ? "عکس چهره انتخاب شده"
                            : "Selected Face Photo"}
                        </p>
                        <p className="text-[10px] text-bmw-textSec flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {language === "fa"
                            ? "ماده اولیه آماده پردازش است"
                            : "Ready for AI processing"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeSourceImage}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title={language === "fa" ? "حذف عکس" : "Remove Photo"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Biometric Face Calibration Controls */}
              {sourceImage && (
                <div className="bg-bmw-hover border border-bmw-border rounded-xl p-5 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-bmw-border/80 pb-2.5">
                    <h4 className="text-xs font-bold text-bmw-text uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-bmw-blue" />
                      {language === "fa"
                        ? "کالیبراسیون بیومتریک چهره"
                        : "Biometric Face Calibration"}
                    </h4>
                    <span className="text-[10px] text-bmw-blue bg-bmw-blue/10 px-2 py-0.5 rounded font-medium">
                      {language === "fa"
                        ? "قابلیت پیشرفته"
                        : "Advanced Feature"}
                    </span>
                  </div>

                  {/* Mask Mode Selector */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-bmw-textSec">
                      {language === "fa"
                        ? "نوع فرآیند تولید تصویر:"
                        : "Image Generation Process:"}
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMaskMode("strict")}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          maskMode === "strict"
                            ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-sm"
                            : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text"
                        }`}
                      >
                        {language === "fa"
                          ? "حفظ صددرصد چهره (توصیه شده)"
                          : "Strict Face Preservation"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaskMode("full")}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          maskMode === "full"
                            ? "bg-bmw-blue/10 border-bmw-blue text-bmw-blue shadow-sm"
                            : "bg-bmw-surface border-bmw-border text-bmw-textSec hover:text-bmw-text"
                        }`}
                      >
                        {language === "fa"
                          ? "تولید آزادانه هوش مصنوعی"
                          : "Full AI Recreation"}
                      </button>
                    </div>
                    <p className="text-[10px] text-bmw-textSec leading-normal">
                      {maskMode === "strict"
                        ? language === "fa"
                          ? "در این حالت، چهره اصلی شما بدون کوچکترین تغییر در محدوده دایره حفظ شده و فقط پس‌زمینه و لباس‌ها تغییر می‌کنند."
                          : "In this mode, your original face remains 100% untouched within the dashed area; only background and clothing are changed."
                        : language === "fa"
                          ? "در این حالت، کل تصویر توسط هوش مصنوعی با الهام از چهره شما مجدداً بازآفرینی خواهد شد."
                          : "In this mode, the entire image is reimagined by the AI using your uploaded photo as a style and likeness reference."}
                    </p>
                  </div>

                  {maskMode === "strict" && (
                    <div className="space-y-3.5 pt-2.5 border-t border-bmw-border/50 animate-fade-in">
                      {/* Position Y Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-bmw-textSec">
                          <span>
                            {language === "fa"
                              ? "موقعیت عمودی بیضی چهره:"
                              : "Vertical Position (Y):"}
                          </span>
                          <span className="font-mono text-bmw-text font-bold">
                            {ovalY}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={ovalY}
                          onChange={(e) => setOvalY(parseInt(e.target.value))}
                          className="w-full accent-bmw-blue bg-bmw-surface rounded-lg appearance-none h-1.5 cursor-pointer"
                        />
                      </div>

                      {/* Position X Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-bmw-textSec">
                          <span>
                            {language === "fa"
                              ? "موقعیت افقی بیضی چهره:"
                              : "Horizontal Position (X):"}
                          </span>
                          <span className="font-mono text-bmw-text font-bold">
                            {ovalX}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={ovalX}
                          onChange={(e) => setOvalX(parseInt(e.target.value))}
                          className="w-full accent-bmw-blue bg-bmw-surface rounded-lg appearance-none h-1.5 cursor-pointer"
                        />
                      </div>

                      {/* Size Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-bmw-textSec">
                          <span>
                            {language === "fa"
                              ? "اندازه و مقیاس دایره چهره:"
                              : "Face Circle Scale:"}
                          </span>
                          <span className="font-mono text-bmw-text font-bold">
                            {ovalSize}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="90"
                          value={ovalSize}
                          onChange={(e) =>
                            setOvalSize(parseInt(e.target.value))
                          }
                          className="w-full accent-bmw-blue bg-bmw-surface rounded-lg appearance-none h-1.5 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-bmw-blue/5 border border-bmw-blue/15 rounded-xl p-4 text-xs leading-relaxed text-bmw-textSec">
              <p className="font-bold text-bmw-text flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-4 h-4 text-bmw-blue shrink-0" />
                {language === "fa"
                  ? "راهنمای استاندارد عکس بیومتریک:"
                  : "Biometric Standards Guide:"}
              </p>
              <ul className="list-disc ps-5 space-y-1 text-[11px]">
                {language === "fa" ? (
                  <>
                    <li>
                      تصویر مرجع انتخابی شما باید ترجیحاً واضح، شفاف و با نور
                      مناسب باشد.
                    </li>
                    <li>
                      پرهیز از عینک دودی، کلاه، ماسک یا هرگونه لوازم تزئینی
                      غیرضروری.
                    </li>
                    <li>
                      رو به دوربین، نگاه مستقیم و با حالت چهره خنثی (بدون لبخند
                      غلیظ).
                    </li>
                    <li>
                      سیستم به صورت هوشمند بر اساس جنسیت انتخابی شما، جزئیات
                      پوشش رسمی را شبیه‌سازی خواهد کرد.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      Your source image should preferably be clear, sharp, and
                      well-lit.
                    </li>
                    <li>
                      Avoid sunglasses, hats, masks, or unnecessary accessories.
                    </li>
                    <li>
                      Look directly at the camera with a neutral facial
                      expression (closed mouth).
                    </li>
                    <li>
                      The system will dynamically reconstruct official formal
                      attire matching your selection.
                    </li>
                  </>
                )}
              </ul>
            </div>
            {isGenerating ? (
              <div className="bg-bmw-hover border border-bmw-border rounded-xl p-5 space-y-3.5 animate-pulse">
                <div className="flex justify-between items-center text-xs font-bold text-bmw-text">
                  <span className="text-bmw-blue animate-pulse flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {progressStep}
                  </span>
                  <span className="font-mono">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-bmw-input rounded-full h-2.5 overflow-hidden border border-bmw-border">
                  <div
                    className="bg-bmw-blue h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_#1c69d4]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!sourceImage || aiPhotoUsed}
                className={`w-full font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  aiPhotoUsed
                    ? "bg-rose-950/40 border border-rose-500/30 text-rose-300 cursor-not-allowed shadow-none"
                    : "bg-bmw-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-blue-500/10"
                }`}
              >
                {aiPhotoUsed ? (
                  <>
                    <Lock className="w-4 h-4 text-rose-400" />
                    {language === "fa"
                      ? "غیرفعال - سقف ۱ بار استفاده تکمیل شده است"
                      : "Disabled - 1-time quota reached"}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    {language === "fa"
                      ? "تولید تصویر پرسنلی هوشمند با هوش مصنوعی"
                      : "Generate AI Biometric Passport Photo"}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="lg:col-span-5 col-span-12 flex flex-col gap-6">
            <div className="bg-bmw-surface border border-bmw-border rounded-xl p-5 shadow-sm flex flex-col items-center text-center space-y-4">
              <h3 className="text-sm font-bold text-bmw-text w-full pb-2 border-b border-bmw-border flex justify-between items-center">
                <span>
                  {language === "fa"
                    ? "خروجی استاندارد ۳:۴ بیومتریک"
                    : "Standard 3:4 Biometric Output"}
                </span>
                {/* <span className="text-[10px] font-mono px-2 py-0.5 bg-green-500/10 text-green-500 rounded uppercase font-bold tracking-wider">
                  {gender === "male"
                    ? language === "fa"
                      ? "آقا"
                      : "MALE"
                    : language === "fa"
                      ? "خانم"
                      : "FEMALE"}
                </span> */}
              </h3>

              {/* Passport Photo Canvas/Holder */}
              <div className="w-56 h-72 border border-bmw-border rounded-lg bg-bmw-hover flex items-center justify-center relative overflow-hidden shadow-inner group">
                {/* Save to Remote Postgres DB Loading Overlay */}
                {isSavingToDb && (
                  <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-20 animate-fade-in text-center">
                    <div className="relative flex items-center justify-center mb-2">
                      <div className="absolute w-12 h-12 rounded-full border-2 border-emerald-400/50 animate-ping" />
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin shrink-0" />
                    </div>
                    <span className="text-xs font-bold text-emerald-300 mb-1">
                      {language === "fa"
                        ? "درحال ذخیره‌سازی در دیتابیس..."
                        : "Saving to Database..."}
                    </span>
                    <span className="text-[10px] text-gray-300">
                      {language === "fa"
                        ? "انتقال و ثبت در پایگاه داده ریموت Postgres"
                        : "Uploading to remote Postgres database"}
                    </span>
                  </div>
                )}

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 z-10 animate-fade-in">
                    <div className="w-10 h-10 rounded-full border-2 border-t-bmw-blue border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3"></div>
                    <span className="text-[11px] text-gray-300 text-center leading-normal animate-pulse">
                      {progressStep}
                    </span>
                    <div
                      className="absolute top-0 left-0 right-0 h-1 bg-bmw-blue/90 shadow-[0_0_15px_#1c69d4] animate-scan"
                      style={{
                        animation: "scan 2s linear infinite",
                        position: "absolute",
                      }}
                    />
                  </div>
                )}

                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Biometric Passport Output"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : sourceImage ? (
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={sourceImage}
                      alt="Uploaded face source"
                      className="w-full h-full object-cover"
                    />

                    {/* Biometric SVG Calibration Overlay */}
                    {maskMode === "strict" &&
                      (() => {
                        const rx = ovalSize * 0.225;
                        const ry = ovalSize * 0.275;
                        return (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <path
                              d={`M 0,0 H 100 V 100 H 0 Z M ${ovalX},${ovalY - ry} a ${rx},${ry} 0 1,0 0,${2 * ry} a ${rx},${ry} 0 1,0 0,-${2 * ry}`}
                              fill="rgba(0, 0, 0, 0.65)"
                              fillRule="evenodd"
                            />
                            <ellipse
                              cx={ovalX}
                              cy={ovalY}
                              rx={rx}
                              ry={ry}
                              fill="none"
                              stroke="#1c69d4"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                            />
                            {/* Target Crosshair */}
                            <line
                              x1={ovalX - 4}
                              y1={ovalY}
                              x2={ovalX + 4}
                              y2={ovalY}
                              stroke="#1c69d4"
                              strokeWidth="0.5"
                            />
                            <line
                              x1={ovalX}
                              y1={ovalY - 4}
                              x2={ovalX}
                              y2={ovalY + 4}
                              stroke="#1c69d4"
                              strokeWidth="0.5"
                            />
                          </svg>
                        );
                      })()}

                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                      <Sparkles className="w-3 h-3 text-bmw-blue animate-pulse" />
                      {maskMode === "strict"
                        ? language === "fa"
                          ? "محدوده حفظ صددرصد چهره"
                          : "Preserved Face Region"
                        : language === "fa"
                          ? "پیش‌نمایش تصویر اولیه"
                          : "Source Photo Preview"}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Image className="w-12 h-12 text-bmw-textSec mx-auto opacity-40" />
                    <p className="text-xs font-bold text-bmw-textSec">
                      {language === "fa"
                        ? "تصویری انتخاب نشده است"
                        : "No photo selected"}
                    </p>
                    <p className="text-[10px] text-bmw-textSec/80 leading-normal">
                      {language === "fa"
                        ? "برای مشاهده پیش‌نمایش، ابتدا عکس مرجع خود را بارگذاری کنید."
                        : "Upload a reference face photo to see standard preview."}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons if Generated */}
              {generatedImage && (
                <div className="w-full space-y-3 pt-2 border-t border-bmw-border animate-fade-in">
                  <button
                    type="button"
                    onClick={handleApplyAsProfile}
                    disabled={isSavingToDb}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/10"
                  >
                    {isSavingToDb ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {language === "fa"
                      ? "تأیید و ذخیره در دیتابیس Postgres و پروفایل"
                      : "Approve & Save to Postgres DB & Profile"}
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="bg-bmw-hover border border-bmw-border hover:border-bmw-text text-bmw-text font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-bmw-blue" />
                      {language === "fa" ? "دانلود تصویر" : "Download Photo"}
                    </button>
                    <button
                      type="button"
                      onClick={removeSourceImage}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      {language === "fa" ? "شروع مجدد" : "Start Over"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
