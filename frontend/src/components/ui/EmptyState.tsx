import React from 'react';
import { motion } from 'framer-motion';
import { Package, Inbox, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  illustration?: 'default' | 'package' | 'alert';
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي بيانات. حاول إضافة عناصر جديدة.',
  icon,
  action,
  illustration = 'default',
  className = '',
}) => {
  const renderIllustration = () => {
    const iconSize = 64;
    const iconColor = 'text-brand-muted/30 dark:text-white/20';

    switch (illustration) {
      case 'package':
        return <Package size={iconSize} className={iconColor} />;
      case 'alert':
        return <AlertCircle size={iconSize} className={iconColor} />;
      default:
        return <Inbox size={iconSize} className={iconColor} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <div className="relative">
          {renderIllustration()}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {renderIllustration()}
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-brand-accent dark:text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-brand-muted/70 dark:text-white/40 max-w-md mb-6"
      >
        {description}
      </motion.p>

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
