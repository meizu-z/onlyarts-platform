import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = 'font-medium transition-all duration-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#8c52ff] to-[#cb6ce6] hover:from-[#7a42e6] hover:to-[#b95cd3] text-white shadow-lg shadow-purple-500/30',
    secondary: 'border-2 border-[#8c52ff] text-[#8c52ff] hover:bg-[#8c52ff]/10 hover:border-[#cb6ce6]',
    ghost: 'text-[#f2e9dd] hover:bg-white/5',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;