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
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder=" " 
        required={required}
        className="block w-full form-field-input" 
        aria-label={label}
      />
      <label htmlFor={id} className="form-field-label">
        {label} {required && '(REQUIRED)'}
      </label>
    </div>
  );
};