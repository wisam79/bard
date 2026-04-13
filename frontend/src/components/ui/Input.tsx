import React from 'react';

interface InputProps {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
  error?: string;
  icon?: React.ReactNode;
  onIconClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  autoFocus = false,
  name,
  id,
  className = '',
  error,
  icon,
  onIconClick,
  onKeyDown,
}) => {
  return (
    <div className="relative">
      {icon && (
        <div
          className={`absolute ${onIconClick ? 'cursor-pointer' : 'pointer-events-none'} left-3 top-1/2 -translate-y-1/2 text-brand-muted/50 dark:text-white/30`}
          onClick={onIconClick}
        >
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        name={name}
        id={id}
        className={`
          w-full px-4 py-3 rounded-xl border transition-all duration-300
          bg-brand-surface/60 dark:bg-white/[0.04] text-brand-accent dark:text-white/90
          placeholder-brand-muted/40 dark:placeholder-white/20
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/55
          focus:bg-brand-surface/80 dark:focus:bg-white/[0.06]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${error
            ? 'border-rose-500/45 focus:ring-rose-500/30'
            : 'border-brand-border/45 dark:border-white/[0.1] focus:border-primary-500/55'
          }
          ${className}
        `}
      />
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
