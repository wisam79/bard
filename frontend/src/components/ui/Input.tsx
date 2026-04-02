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
          className={`absolute ${onIconClick ? 'cursor-pointer' : 'pointer-events-none'} left-3 top-1/2 -translate-y-1/2 text-gray-400`}
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
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          bg-brand-surface text-brand-accent
          placeholder-brand-accent/40
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-brand-border/40 focus:border-primary-500'
          }
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
