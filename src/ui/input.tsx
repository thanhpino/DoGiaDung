import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
}

// eslint-disable-next-line react/display-name
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelClassName = '', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={`block text-sm font-medium mb-1.5 ${labelClassName || 'text-gray-700 dark:text-gray-300'}`} htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";