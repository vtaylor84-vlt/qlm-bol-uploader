import React from 'react';

interface Theme { // Define a simple Theme interface for props
    text: string;
    border: string;
    focusRing: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  theme: Theme; // FIX 1: Accept theme prop
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, required = false, theme }) => {
  const hasValue = value !== ''; 
  
  return (
    <div className="relative"> 
      {label && ( 
        <label htmlFor={id} className={`block text-xs font-bold ${theme.text} mb-1 uppercase tracking-wider`}> {/* FIX 2: Apply theme text color */}
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          // FIX 3: Apply dynamic border and focus ring classes
          className={`block w-full bg-gray-900 border ${theme.border} py-3 px-4 appearance-none focus:outline-none focus:ring-1 ${theme.focusRing} transition-all duration-200 ${hasValue ? 'text-cyan-100' : 'text-gray-500'}`}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.value === ""} 
              className="bg-gray-800 text-cyan-100" 
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
        </div>
      </div>
    </div>
  );
};