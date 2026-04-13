import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField - a standardised wrapper for form inputs.
 * Provides a consistent label + error/hint pattern across all pages.
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1 text-[11px] font-black text-brand-muted/60 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-[11px] font-bold text-red-400 flex items-center gap-1 mt-1">
          <span className="w-3 h-3 rounded-full bg-red-400/20 inline-flex items-center justify-center text-[8px]">!</span>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-[11px] text-brand-muted/45 mt-0.5">{hint}</p>
      )}
    </div>
  );
};

export default FormField;
