// src/components/SelectField.tsx (COMPLETE, FINAL SCRIPT)
import React from 'react'; 
import { CompanyName } from '@/types.ts';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps {
    // FIX TS2322: Enforce 'id' is a string for 'htmlFor' prop compatibility
    id: string; 
    label: string;
    value: string | CompanyName;
    options: SelectOption[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ id, label, value, options, onChange, required = false }) => {
    return (
        <div className="flex flex-col space-y-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-[--color-primary] focus:border-transparent transition duration-200"
            >
                {options.map((option, index) => (
                    <option
                        key={index}
                        value={option.value}
                        // We fixed the disabled prop type in Step 19.
                        disabled={option.value === "" || option.value === 'default'} 
                        className={option.value === '' ? 'text-gray-500' : 'text-white'}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};