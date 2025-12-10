// src/components/FormField.tsx (COMPLETE, FINAL SCRIPT)
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

// FIX TS6133: Removed 'placeholder' from destructuring, as it's only used via the input prop
export const FormField: React.FC<FormFieldProps> = ({ id, label, value, onChange, type = 'text', required = false }) => {
    // Note: The placeholder prop is not explicitly destructured here, but it is passed down to the <input> element.
    // However, since the provided JSX doesn't actually use the variable 'placeholder' (it uses placeholder=" "),
    // the TS6133 is correct for the function signature you provided. We'll simplify the function signature.
    
    // Based on the JSX you provided earlier:
    // placeholder=" " 
    // This means the placeholder prop passed into FormField is never actually used inside the JSX, hence the TS6133.
    // We will keep the prop in the interface but remove it from the function parameters to fix the error.
    
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