import { toastStore, type ToastType } from "../components/UI/Toast";

type ToastOptions = {
  title?: string;
  duration?: number;
  dismissible?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

function show(type: ToastType, message: string, options?: ToastOptions) {
  return toastStore.add({
    type,
    message,
    ...options,
  });
}

export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) =>
      show("success", message, options),

    error: (message: string, options?: ToastOptions) =>
      show("error", message, options),

    warning: (message: string, options?: ToastOptions) =>
      show("warning", message, options),

    info: (message: string, options?: ToastOptions) =>
      show("info", message, options),

    loading: (message: string, options?: ToastOptions) =>
      show("loading", message, { ...options, duration: 0 }),

    dismiss: (id: string) => toastStore.dismiss(id),

    update: (
      id: string,
      patch: ToastOptions & { message?: string; type?: ToastType },
    ) => toastStore.update(id, patch),

    promise: async <T>(
      promise: Promise<T>,
      msgs: {
        loading: string;
        success: string | ((res: T) => string);
        error: string | ((err: any) => string);
      },
      options?: ToastOptions,
    ) => {
      const id = show("loading", msgs.loading, { ...options, duration: 0 });

      try {
        const res = await promise;
        toastStore.update(id, {
          type: "success",
          message:
            typeof msgs.success === "function"
              ? msgs.success(res)
              : msgs.success,
          duration: options?.duration ?? 2500,
        });
        // after update, schedule dismiss
        window.setTimeout(
          () => toastStore.dismiss(id),
          options?.duration ?? 2500,
        );
        return res;
      } catch (err) {
        toastStore.update(id, {
          type: "error",
          message:
            typeof msgs.error === "function" ? msgs.error(err) : msgs.error,
          duration: options?.duration ?? 3500,
        });
        window.setTimeout(
          () => toastStore.dismiss(id),
          options?.duration ?? 3500,
        );
        throw err;
      }
    },
  };
}
