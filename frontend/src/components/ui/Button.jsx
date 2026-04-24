import React from 'react';

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false, 
  onClick, 
  type = "button",
  className = "",
  icon = null,
  iconPosition = "left"
}) => {
  const baseClasses = "font-semibold rounded-16 transition-all active:scale-95 transition-transform flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-primary-container text-on-primary shadow-lg hover:brightness-110",
    secondary: "border border-primary-container text-primary-container hover:bg-emerald-50",
    tertiary: "bg-secondary-container text-on-secondary-container",
    ghost: "text-emerald-700 hover:bg-emerald-50",
    danger: "bg-error-container text-on-error"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const renderIcon = () => {
    if (!icon) return null;
    return <span className="material-symbols-outlined">{icon}</span>;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      {children}
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
};

export default Button;
