import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/30 dark:bg-black/50 backdrop-blur-md animate-fade-in"
      onClick={closeOnOverlayClick ? () => onClose() : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`
          w-full ${sizeClasses[size]} bg-brand-surface/95 dark:bg-[#2d2d30]/95
          border border-brand-border/30 dark:border-white/[0.06]
          rounded-2xl shadow-2xl transform transition-all
          flex flex-col max-h-[90vh] overflow-hidden
          backdrop-blur-2xl
          animate-fade-in-scale
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-5 border-b border-brand-border/15 dark:border-white/[0.04] bg-brand-surface/30 dark:bg-white/[0.02]">
            {title && (
              <h2 id="modal-title" className="text-lg font-black text-brand-accent dark:text-white tracking-tight">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-border/20 dark:hover:bg-white/[0.06] text-brand-accent/30 dark:text-white/20 hover:text-brand-accent dark:hover:text-white/60 transition-all duration-200 active:scale-90"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="p-5 overflow-y-auto flex-1 text-brand-accent/80 dark:text-white/70">
          {children}
        </div>

        {footer && (
          <div className="p-5 border-t border-brand-border/15 dark:border-white/[0.04] flex justify-end gap-3 bg-brand-surface/30 dark:bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
