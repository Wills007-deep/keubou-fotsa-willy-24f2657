import React from 'react';

const Card = ({ children, className = "", padding = "lg", shadow = "soft" }) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6", 
    lg: "p-8",
    xl: "p-10"
  };

  const shadowClasses = {
    none: "",
    soft: "soft-shadow",
    "soft-lg": "soft-shadow-lg"
  };

  return (
    <div className={`
      bg-white 
      ${paddingClasses[padding] || paddingClasses.lg} 
      ${shadowClasses[shadow] || shadowClasses.soft} 
      border border-emerald-900/5 
      rounded-16 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
