import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'facebook' | 'google';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#ea8d35] text-white hover:bg-[#d47b28] shadow-md", // Đã fix màu cam cứng
    outline: "bg-transparent border border-[#4a3b32] text-[#4a3b32] hover:bg-[#fff8f0]",
    ghost: "bg-transparent text-[#4a3b32] hover:bg-black/5",
    facebook: "bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-md",
    google: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-md",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};