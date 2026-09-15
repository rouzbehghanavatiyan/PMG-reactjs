import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, RefreshCw, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'loading' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  removeToast?: (id: string) => void;
  dir?: 'rtl' | 'ltr';
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, removeToast, dir = 'rtl' }) => {
  const dismissHandler = onDismiss || removeToast || (() => {});
  if (toasts.length === 0) return null;

  return (
    <div 
      className={`fixed top-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none transition-all duration-300 ${
        dir === 'rtl' ? 'left-5' : 'right-5'
      }`}
      dir={dir}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissHandler} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss?: (id: string) => void }> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (toast.type === 'loading' || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismissRef.current?.(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.type, duration]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/50 bg-gray-900/95 text-white shadow-emerald-500/20 shadow-lg',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          border: 'border-rose-500/50 bg-gray-900/95 text-white shadow-rose-500/20 shadow-lg',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          progress: 'bg-rose-500'
        };
      case 'loading':
        return {
          border: 'border-bmw-blue/50 bg-gray-900/95 text-white shadow-bmw-blue/20 shadow-lg',
          icon: <RefreshCw className="w-5 h-5 text-bmw-blue shrink-0 animate-spin" />,
          progress: 'bg-bmw-blue'
        };
      default:
        return {
          border: 'border-blue-500/50 bg-gray-900/95 text-white shadow-blue-500/20 shadow-lg',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          progress: 'bg-blue-500'
        };
    }
  };

  const style = getStyles();

  return (
    <div className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3 ${style.border}`}>
      {style.icon}
      <div className="flex-1 min-w-0 pr-1">
        {toast.title && <h4 className="text-xs font-bold text-gray-100 mb-0.5">{toast.title}</h4>}
        <p className="text-xs text-gray-300 leading-relaxed break-words">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss?.(toast.id)}
        className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar animation */}
      {toast.type !== 'loading' && duration > 0 && (
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 ${style.progress} opacity-80`}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`
          }}
        />
      )}
    </div>
  );
};