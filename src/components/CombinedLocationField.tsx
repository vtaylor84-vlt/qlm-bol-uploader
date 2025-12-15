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
}

export const CombinedLocationField: React.FC<CombinedLocationFieldProps> = ({
  prefix,
  label,
  cityValue,
  stateValue,
  handleInputChange,
  stateOptions,
}) => {
  return (
    // This div handles the consistent vertical spacing between the two location fields in App.tsx
    <div className="mb-4"> 
      {/* FIX 1: Set explicit header label (e.g., PICKUP CITY) */}
      <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm mb-1">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* City Input */}
        <FormField
          id={`${prefix}City`}
          label="" // Label is hidden, using the h3 above
          value={cityValue}
          onChange={handleInputChange}
          placeholder="City"
        />
        
        {/* State Dropdown */}
        <SelectField
          id={`${prefix}State`}
          label="" // Label is hidden, using the h3 above
          value={stateValue}
          onChange={handleInputChange}
          options={stateOptions}
        />
      </div>
    </div>
  );
};