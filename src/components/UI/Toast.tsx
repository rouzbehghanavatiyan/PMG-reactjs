export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  createdAt: number;
  dismissible?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2) + Date.now().toString(16);

function emit() {
  listeners.forEach((l) => l(toasts));
}

export const toastStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(toasts);
    return () => {
      listeners.delete(listener);
    };
  },

  get() {
    return toasts;
  },

  add(input: Omit<Toast, "id" | "createdAt"> & { id?: string }) {
    const id = input.id ?? uid();

    const toast: Toast = {
      id,
      createdAt: Date.now(),
      dismissible: true,
      duration: input.type === "loading" ? 0 : 3500,
      ...input,
    };

    // newest on top
    toasts = [toast, ...toasts];
    emit();

    // auto dismiss
    if (toast.duration && toast.duration > 0) {
      window.setTimeout(() => {
        toastStore.dismiss(id);
      }, toast.duration);
    }

    return id;
  },

  dismiss(id: string) {
    const next = toasts.filter((t) => t.id !== id);
    if (next.length !== toasts.length) {
      toasts = next;
      emit();
    }
  },

  update(id: string, patch: Partial<Omit<Toast, "id" | "createdAt">>) {
    let found = false;
    toasts = toasts.map((t) => {
      if (t.id !== id) return t;
      found = true;
      return { ...t, ...patch };
    });
    if (found) emit();
  },

  clear() {
    toasts = [];
    emit();
  },
};
