'use client';
import React from 'react';

interface EditTextProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  fullWidth?: boolean;
}

const EditText: React.FC<EditTextProps> = ({
  placeholder = '',
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  leftIcon,
  rightIcon,
  error,
  label,
  fullWidth = true,
  ...props
}) => {
  // const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const baseClasses = `
    transition-all duration-200 ease-in-out
    border border-[#5c4228] rounded-[30px]
    bg-[#fff3ee] text-[#111111]
    placeholder:text-[#6d6d6d]
    focus:outline-none focus:ring-2 focus:ring-[#f37335] focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    text-sm sm:text-base
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${leftIcon ? 'pl-10 sm:pl-12' : 'pl-3 sm:pl-4'}
    ${rightIcon ? 'pr-10 sm:pr-12' : 'pr-7 sm:pr-8'}
    py-3 sm:py-4
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[#111111] mb-1 sm:mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#6d6d6d]">
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={handleChange}
          // onFocus={() => setIsFocused(true)}
          // onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-[#6d6d6d]">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default EditText;