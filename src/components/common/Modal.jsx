import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md',
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        className={`
          bg-[#1a1a1a] rounded-3xl ${sizes[size]} w-full 
          max-h-[90vh] overflow-y-auto
          border border-white/10 shadow-2xl
          animate-scaleIn
        `}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 p-6 flex justify-between items-center z-10">
            {title && (
              <h2 className="text-2xl font-bold text-[#f2e9dd]">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-[#f2e9dd] hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors ml-auto"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;