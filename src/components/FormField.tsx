import React from 'react';

interface Theme { // Define a simple Theme interface for props
  text: string;
  border: string;
  focusRing: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  theme: Theme; // FIX 1: Accept theme prop
}

export const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  required = false,
  theme // FIX 1
}) => {
  return (
    <div className="relative">
      {label && ( 
        <label htmlFor={id} className={`block text-xs font-bold ${theme.text} mb-1 uppercase tracking-wider`}> {/* FIX 2: Apply theme text color */}
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder={placeholder} 
        required={required}
        // FIX 3: Apply dynamic border and focus ring classes
        className={`block w-full bg-gray-900 border ${theme.border} text-cyan-100 py-3 px-4 focus:outline-none focus:ring-1 ${theme.focusRing} transition-all duration-200`}
        aria-label={label || id}
      />
    </div>
  );
};