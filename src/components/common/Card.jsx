import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  noPadding = false,
  onClick,
}) => {
  const padding = noPadding ? '' : 'p-6';
  
  return (
    <div
      onClick={onClick}
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
