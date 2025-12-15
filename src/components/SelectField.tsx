import React from 'react';

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, onChange, options, required = false }) => {
  const hasValue = value !== ''; // Check if a real value is selected
  
  return (
    // FIX 1: Removed redundant mb-4 margin
    <div className="relative"> 
      <label htmlFor={id} className="block text-xs font-bold text-cyan-400 mb-1 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className={`block w-full bg-gray-900 border border-gray-700 py-3 px-4 appearance-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 ${hasValue ? 'text-cyan-100' : 'text-gray-500'}`}
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