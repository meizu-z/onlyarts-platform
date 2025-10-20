import React from 'react';

const Input = ({ 
  label, 
  error, 
  helperText,
  className = '', 
  containerClassName = '',
  type = 'text',
  ...props 
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-[#f2e9dd]/70 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full bg-[#121212] border rounded-lg px-4 py-3 
          text-[#f2e9dd] placeholder:text-[#f2e9dd]/40
          focus:outline-none focus:ring-2 focus:ring-[#8c52ff]/50
          transition-all duration-200
          ${error ? 'border-red-500' : 'border-white/10 focus:border-[#8c52ff]'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[#f2e9dd]/50 text-sm mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;