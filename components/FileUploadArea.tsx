/**
 * TACTICAL UPLINK: SILENT TRANSCODER v3.0
 * Logic: Intercepts mobile proprietary formats (HEIC/RAW) 
 * and high-bitrate Pixel 10 HD photos for web optimization.
 */

// Inside your FileUploadArea component:
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles) return;

    // Trigger a low-frequency hum to signal processing initiation
    if (typeof triggerPulse === 'function') triggerPulse(400, 'sine', 0.2);

    const processedFiles = await Promise.all(
        Array.from(rawFiles).map(async (file) => {
            let processedFile = file;

            // 1. HEIC Handling (iPhone specific)
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                try {
                    // We dynamically import to keep the initial load light (Senior Expert Optimization)
                    const heic2any = (await import('heic2any')).default;
                    const blob: any = await heic2any({ 
                        blob: file, 
                        toType: 'image/jpeg',
                        quality: 0.8 
                    });
                    processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
                } catch (err) {
                    console.error("HEIC_TRANSCODE_FAILURE", err);
                }
            }

            // 2. Pixel 10 / HD Compression (Canvas Downsampling)
            // If file > 5MB, we downsample to ensure the browser doesn't choke on the preview
            if (processedFile.type.startsWith('image/') && processedFile.size > 5 * 1024 * 1024) {
                processedFile = await compressImage(processedFile);
            }

            return {
                id: crypto.randomUUID(),
                file: processedFile,
                previewUrl: URL.createObjectURL(processedFile),
                progress: 0,
                timestamp: new Date().toLocaleTimeString()
            };
        })
    );

    // Call your existing state update function
    onFileChange({ target: { files: processedFiles } } as any, id);
};

// HELPER: Professional Grade Canvas Compression
const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920; // 1080p Standard for Logistics
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }
                }, 'image/jpeg', 0.8);
            };
        };
    });
};