import React from 'react';

interface ToggleSwitchProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-dark/25 border border-brand-border/30 cursor-pointer group transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/35 hover:bg-brand-dark/35'
      }`}
    >
      <div className="flex-1">
        <p className="text-sm font-bold dark:text-white text-gray-900 group-hover:text-primary-400 transition-colors">
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-brand-muted/60 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Toggle Track */}
      <div className="relative flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={`w-12 h-6 rounded-full transition-all duration-300 border ${
            checked
              ? 'bg-primary-500 border-primary-600 shadow-lg shadow-primary-500/35'
              : 'bg-brand-dark/50 border-brand-border/60'
          }`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
              checked ? 'right-0.5 left-auto' : 'left-0.5 right-auto'
            }`}
          />
        </div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
