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

export const FormField: React.FC<FormFieldProps> = ({ id, label, value, onChange, placeholder, type = 'text', required = false }) => {
  return (
    <div className="relative form-field-container">
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void} // Cast for input element only
        placeholder=" " // Note: A single space is used to trigger :placeholder-shown
        required={required}
        className="block w-full form-field-input"
        aria-label={label}
      />
      <label htmlFor={id} className="form-field-label">
        {label} {required && '(REQUIRED)'}
      </label>
      {placeholder && !value && <span className="absolute left-3 bottom-2 text-gray-500 text-sm pointer-events-none">{placeholder}</span>}
    </div>
  );
};