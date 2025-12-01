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
    // ⚠️ CRITICAL FIX: Applying the custom container class
    <div className="form-field-container"> 
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
        placeholder=" " // Note: This space is critical for the custom CSS logic
        required={required}
        // ⚠️ CRITICAL FIX: Applying the custom input class
        className="block w-full form-field-input" 
        aria-label={label}
      />
      {/* ⚠️ CRITICAL FIX: Applying the custom label class */}
      <label htmlFor={id} className="form-field-label">
        {label} {required && '(REQUIRED)'}
      </label>
      {/* Retaining the placeholder logic as per original design, but the custom CSS handles most of it */}
    </div>
  );
};