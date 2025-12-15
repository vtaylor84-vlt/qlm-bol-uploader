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
    // Determine the specific city placeholder text based on the prefix
    const cityPlaceholder = prefix === 'pu' ? 'enter the pickup city' : 'enter the delivery city';

  return (
    // This div handles the consistent vertical spacing between the two location fields in App.tsx
    <div className="mb-4"> 
      <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm mb-1">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* City Input */}
        <FormField
          id={`${prefix}City`}
          label="" // Label is hidden, using the h3 above
          value={cityValue}
          onChange={handleInputChange}
          // FIX 4/5: Use the dynamic placeholder
          placeholder={cityPlaceholder}
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