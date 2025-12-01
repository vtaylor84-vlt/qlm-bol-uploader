import React, { SelectHTMLAttributes } from 'react';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[]; // Standardized on object structure
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, required = false }) => {
  const hasValue = value !== "";
  return (
    <div className="relative form-field-container">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`block w-full form-field-input appearance-none ${!hasValue ? 'text-gray-500' : 'text-white'}`}
        aria-label={label}
      >
        {/* Render options from the array */}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.value === "default"} 
            className="bg-gray-900 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="form-field-label">
        {label} {required && '(REQUIRED)'}
      </label>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 pt-2 text-gray-400">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
        </div>
    </div>
  );
};