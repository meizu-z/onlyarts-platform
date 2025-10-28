import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

// 🎯 ICON MAPPING
const icons = {
  success: <CheckCircle className="h-6 w-6 text-emerald-500" />,
  error: <XCircle className="h-6 w-6 text-rose-500" />,
  info: <Info className="h-6 w-6 text-indigo-500" />,
  warning: <AlertCircle className="h-6 w-6 text-amber-500" />,
};

// 🎯 TOAST COMPONENT
const Toast = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onClose]);

  const baseClasses = "w-full bg-[#1a1a1a] shadow-lg rounded-lg pointer-events-auto border overflow-hidden backdrop-blur-sm";
  const typeClasses = {
    success: "border-emerald-500/50 bg-emerald-500/10",
    error: "border-rose-500/50 bg-rose-500/10",
    info: "border-indigo-500/50 bg-indigo-500/10",
    warning: "border-amber-500/50 bg-amber-500/10",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            {icons[type]}
          </div>

          {/* Message */}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-[#f2e9dd]">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(id)}
              className="rounded-md inline-flex text-[#f2e9dd]/40 hover:text-[#f2e9dd]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] focus:ring-[#f2e9dd]/20 transition-colors"
            >
              <span className="sr-only">Close</span>
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 TOAST CONTAINER
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none w-full max-w-sm px-4 md:px-0">
      <div className="pointer-events-auto space-y-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

// 🎯 TOAST CONTEXT & HOOK
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    // Use a more robust unique ID
    const id = Date.now() + Math.random(); 
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toastApi = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    info: (message) => addToast('info', message),
    warning: (message) => addToast('warning', message),
  };

  return (
    <ToastContext.Provider value={toastApi}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
