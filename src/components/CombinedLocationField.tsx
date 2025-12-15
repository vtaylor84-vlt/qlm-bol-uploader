import React, { ChangeEvent } from 'react';
import { FormField } from './FormField';
import { SelectField } from './SelectField';

interface CombinedLocationFieldProps {
  prefix: 'pu' | 'del';
  label: string;
  cityValue: string;
  stateValue: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  stateOptions: { value: string; label: string }[];
  required?: boolean;
}

export const CombinedLocationField: React.FC<CombinedLocationFieldProps> = ({
  prefix,
  label,
  cityValue,
  stateValue,
  handleInputChange,
  stateOptions,
  required = false,
}) => {
    // FIX 1/2: Update City placeholder text
    const cityPlaceholder = prefix === 'pu' ? 'PU City' : 'Del City';

  return (
    <div className="mb-4"> 
      {/* FIX 4/5: Add required indicator to the combined header */}
      <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm mb-1">
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
        />
        
        {/* State Dropdown */}
        <SelectField
          id={`${prefix}State`}
          label="" 
          value={stateValue}
          onChange={handleInputChange}
          options={stateOptions}
        />
      </div>
    </div>
  );
};