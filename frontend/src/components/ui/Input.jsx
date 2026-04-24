import React from 'react';

const Input = ({ 
  label, 
  placeholder, 
  type = "text", 
  value, 
  onChange, 
  error = null, 
  disabled = false, 
  required = false,
  className = "",
  icon = null,
  helperText = null
}) => {
  const baseClasses = "w-full px-4 py-3 border rounded-16 bg-surface-container-lowest text-on-surface transition-all outline-none font-body-md";
  const stateClasses = error 
    ? "border-error focus:border-error focus:ring-2 focus:ring-error/20" 
    : "border-emerald-200 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-surface-container" : "";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-on-surface font-label-caps">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
            {icon}
          </span>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${disabledClasses}
            ${icon ? 'pl-10' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error font-body-md">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-on-surface-variant font-body-md">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
