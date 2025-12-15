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
    // FIX 1: Removed space-y-1 and using mb-4 for consistency
    <div className="mb-4">
      <h3 className="font-bold text-cyan-400 uppercase tracking-wider text-sm mb-1">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* City Input */}
        <FormField
          id={`${prefix}City`}
          label="" // Hidden label
          value={cityValue}
          onChange={handleInputChange}
          placeholder="City"
        />
        
        {/* State Dropdown */}
        <SelectField
          id={`${prefix}State`}
          label="" // Hidden label
          value={stateValue}
          onChange={handleInputChange}
          options={stateOptions}
        />
      </div>
    </div>
  );
};