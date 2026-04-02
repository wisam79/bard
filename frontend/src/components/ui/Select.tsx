import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: Option[];
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  children,
  placeholder = 'اختر...',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          bg-brand-surface text-brand-accent
          focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50' : 'border-brand-border/40'}
          ${className}
        `}
        dir="rtl"
      >
        <option value="">{placeholder}</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
