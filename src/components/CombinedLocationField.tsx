import React, { ChangeEvent } from 'react';
import { FormField } from './FormField';
import { SelectField } from './SelectField';

interface Theme {
    text: string;
    border: string;
    focusRing: string;
}

interface CombinedLocationFieldProps {
  prefix: 'pu' | 'del';
  label: string;
  cityValue: string;
  stateValue: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  stateOptions: { value: string; label: string }[];
  required?: boolean;
  theme: Theme; // FIX 1: Accept theme prop
}

export const CombinedLocationField: React.FC<CombinedLocationFieldProps> = ({
  prefix,
  label,
  cityValue,
  stateValue,
  handleInputChange,
  stateOptions,
  required = false,
  theme, // FIX 1
}) => {
    const cityPlaceholder = prefix === 'pu' ? 'PU City' : 'Del City';

  return (
    <div className="mb-4"> 
      {/* FIX 2: Apply theme text color */}
      <h3 className={`font-bold ${theme.text} uppercase tracking-wider text-sm mb-1`}>
          {label} {required && <span className="text-red-400">*</span>}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {/* City Input */}
        <FormField
          id={`${prefix}City`}
          label="" 
          value={cityValue}
          onChange={handleInputChange}
          placeholder={cityPlaceholder}
          required={required}
          theme={theme} // FIX 3: Pass theme down
        />
        
        {/* State Dropdown */}
        <SelectField
          id={`${prefix}State`}
          label="" 
          value={stateValue}
          onChange={handleInputChange}
          options={stateOptions}
          theme={theme} // FIX 4: Pass theme down
        />
      </div>
    </div>
  );
};