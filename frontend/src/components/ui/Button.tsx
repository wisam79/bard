import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-[1px] active:scale-[0.97]',
  secondary: 'bg-brand-surface/60 dark:bg-white/[0.04] text-brand-accent dark:text-white/80 border border-brand-border/40 dark:border-white/[0.08] hover:bg-brand-border/20 dark:hover:bg-white/[0.07] active:scale-[0.97]',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-[1px] active:scale-[0.97]',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:-translate-y-[1px] active:scale-[0.97]',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:-translate-y-[1px] active:scale-[0.97]',
  ghost: 'bg-transparent text-brand-accent/50 dark:text-white/30 hover:bg-brand-border/15 dark:hover:bg-white/[0.04] hover:text-brand-accent dark:hover:text-white/60 active:scale-[0.97]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
  icon,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-300 focus:outline-none focus:ring-2
        focus:ring-primary-500/30 focus:ring-offset-2 dark:focus:ring-offset-brand-dark
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
};

export default Button;
