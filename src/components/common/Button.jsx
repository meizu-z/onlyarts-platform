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
    primary: 'bg-gradient-to-r from-[#8c52ff] to-[#cb6ce6] hover:from-[#7a42e6] hover:to-[#b95cd3] text-white shadow-lg shadow-purple-500/30 light:from-[#c8b3ff] light:to-[#e5d0ff] light:hover:from-[#b8a0ff] light:hover:to-[#d9c0ff] light:text-[#5a3a9e] light:shadow-purple-300/20',
    secondary: 'border-2 border-[#8c52ff] text-[#8c52ff] hover:bg-[#8c52ff]/10 hover:border-[#cb6ce6] light:border-[#c8b3ff] light:text-[#7952cc] light:hover:bg-[#e5d0ff]/30 light:hover:border-[#b8a0ff]',
    ghost: 'text-[#f2e9dd] hover:bg-white/5 light:text-[#3d3d3d] light:hover:bg-[#e5d0ff]/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white light:bg-[#ffb3ba] light:hover:bg-[#ffa0a8] light:text-[#8b0000]',
    success: 'bg-green-600 hover:bg-green-700 text-white light:bg-[#b3e5b3] light:hover:bg-[#a0dda0] light:text-[#1a5c1a]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm',
    md: 'px-4 py-2 text-sm md:px-6 md:py-2.5 md:text-base',
    lg: 'px-5 py-2.5 text-base md:px-8 md:py-3 md:text-lg'
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