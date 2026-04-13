import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: React.ReactNode;
  position?: 'center' | 'top' | 'right';
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
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
  position = 'center',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: position === 'center' ? 0.95 : 1,
      x: position === 'right' ? 100 : 0,
      y: position === 'top' ? -50 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/50 dark:bg-black/70 backdrop-blur-sm"
          onClick={closeOnOverlayClick ? () => onClose() : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              w-full ${sizeClasses[size]}
              bg-brand-surface/98 dark:bg-[#1a1d33]/98
              border border-brand-border/40 dark:border-white/[0.1]
              rounded-xl shadow-2xl
              flex flex-col max-h-[90vh] overflow-hidden
              backdrop-blur-2xl
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-5 border-b border-brand-border/30 dark:border-white/[0.08] bg-brand-surface/50 dark:bg-white/[0.03]">
                {title && (
                  <h2 id="modal-title" className="text-lg font-bold text-brand-accent dark:text-white tracking-tight">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-brand-border/25 dark:hover:bg-white/[0.08] text-brand-muted/50 dark:text-white/30 hover:text-brand-accent dark:hover:text-white/70 transition-all"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 text-brand-accent/90 dark:text-white/80">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-5 border-t border-brand-border/30 dark:border-white/[0.08] flex justify-end gap-3 bg-brand-surface/50 dark:bg-white/[0.03]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
