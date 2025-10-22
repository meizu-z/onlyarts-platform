import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  noPadding = false,
  // Removed the generic onClick prop to avoid conflicts
}) => {
  const padding = noPadding ? '' : 'p-6';
  
  return (
    <div
      className={`
        bg-[#121212] rounded-2xl overflow-hidden 
        border border-white/5
        transition-all duration-200
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
