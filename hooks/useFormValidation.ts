import { useMemo } from 'react';
import { LoadSubmission, SelectedFile } from '@/types'; // Fixed import path

export const useFormValidation = (form: LoadSubmission, files: SelectedFile[]) => {
    const isValid = useMemo(() => {
        const hasCompanyAndDriver = form.company !== 'default' && form.driverName.trim().length > 0;
        const hasIdentification = form.loadNumber.trim().length > 0 || 
                                 form.bolNumber.trim().length > 0 || 
                                 (form.puCity.trim().length > 0 && form.delCity.trim().length > 0); // Corrected property names to match Form.tsx
        const hasFiles = files.length > 0;

        return hasCompanyAndDriver && hasIdentification && hasFiles;
    }, [form, files]);

    return { isValid };
};