import { useState } from "react";
import { useToast } from "./useToast";

type ApiFn<T> = (...args: any[]) => Promise<T>;

export const useApi = <T>() => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const call = async (
    apiFn: ApiFn<T>,
    options?: {
      onSuccess?: (data: any) => void;
      onError?: (message: string) => void;
      successMessageKey?: string;
      showSuccessMessage?: boolean; 
    },
  ) => {
    setLoading(true);

    try {
      const res: any = await apiFn();
      const data: any = res?.data;
      const code = data?.code;

      if (code === 0) {
        options?.onSuccess?.(data);

        const msg = data?.message || data?.result?.message || "عملیات موفق بود";

        if (options?.showSuccessMessage !== false) {
          toast.success(msg);
        }
      } else {
        const msg = data?.message || "خطا در عملیات";
        toast.error(msg);
        options?.onError?.(msg);
      }

      return data;
    } catch (err: any) {
      const msg = "خطا در ارتباط با سرور";
      toast.error(msg);
      options?.onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return { call, loading };
};