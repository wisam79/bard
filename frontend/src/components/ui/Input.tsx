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
          className={`absolute ${onIconClick ? 'cursor-pointer' : 'pointer-events-none'} left-3 top-1/2 -translate-y-1/2 text-brand-accent/25 dark:text-white/20`}
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
          bg-brand-surface/50 dark:bg-white/[0.03] text-brand-accent dark:text-white/90
          placeholder-brand-accent/25 dark:placeholder-white/10
          focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500/50
          focus:bg-brand-surface/70 dark:focus:bg-white/[0.05]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${error
            ? 'border-rose-500/40 focus:ring-rose-500/25'
            : 'border-brand-border/30 dark:border-white/[0.06] focus:border-primary-500/50'
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
