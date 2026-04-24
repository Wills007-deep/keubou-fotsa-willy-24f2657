import React from 'react';

const Chip = ({ 
  children, 
  variant = "default", 
  size = "md", 
  className = "",
  icon = null 
}) => {
  const baseClasses = "inline-flex items-center gap-1 rounded-full font-semibold";
  
  const variantClasses = {
    default: "bg-secondary-container text-on-secondary-container",
    primary: "bg-primary-container text-on-primary",
    success: "bg-tertiary-container text-on-tertiary-container",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-error-container text-on-error",
    outline: "border border-emerald-200 text-emerald-700 bg-emerald-50"
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <span className={`
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      {children}
    </span>
  );
};

export default Chip;
