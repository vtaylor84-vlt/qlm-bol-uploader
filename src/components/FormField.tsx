import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  required = false 
}) => {
  // FIX: Restore mb-4 if a label is provided, for correct spacing when used standalone.
  const wrapperClass = label ? 'relative mb-4' : 'relative'; 

  return (
    <div className={wrapperClass}>
      {label && ( // Only render label if it exists
        <label htmlFor={id} className="block text-xs font-bold text-cyan-400 mb-1 uppercase tracking-wider">
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
        className="block w-full bg-gray-900 border border-gray-700 text-cyan-100 py-3 px-4 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
        aria-label={label || id}
      />
    </div>
  );
};