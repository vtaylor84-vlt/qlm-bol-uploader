// hooks/useFormValidation.ts (COMPLETE, FINAL SCRIPT)
import { useMemo } from 'react';
// FIX TS6133: Ensure all types are imported, including SelectedFile.
import { LoadSubmission, SelectedFile } from '@/types'; 

export const useFormValidation = (form: LoadSubmission, files: SelectedFile[]) => {
    const isValid = useMemo(() => {
        const hasCompanyAndDriver = form.company !== 'default' && form.driverName.trim().length > 0;
        
        // Logic: Requires Load # OR BOL # OR a Pickup/Delivery City pair
        const hasIdentification = form.loadNumber.trim().length > 0 || 
                                 form.bolNumber.trim().length > 0 || 
                                 (form.puCity.trim().length > 0 && form.delCity.trim().length > 0); 

        const hasFiles = files.length > 0;

        return hasCompanyAndDriver && hasIdentification && hasFiles;
    }, [form, files]);
    
    // FIX TS6133: Removed unused local variable 'SelectedFile' import which was actually an interface. 
    // The previous code had a reference to SelectedFile inside the function body which is now correctly only used for typing the 'files' parameter.

    return { isValid };
};