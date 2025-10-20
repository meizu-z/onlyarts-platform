import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  noPadding = false,
  onClick
}) => {
  const hoverEffect = hover ? 'hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer' : '';
  const padding = noPadding ? '' : 'p-6';
  
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#121212] rounded-2xl overflow-hidden 
        border border-white/5
        transition-all duration-200
        ${hoverEffect}
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;