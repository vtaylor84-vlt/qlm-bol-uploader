/**
 * TACTICAL UPLINK: ASYNC TRANSCODER v3.1
 * Logic: Atomic state updates to prevent race conditions in multi-file previews.
 */

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    // Tactical Haptic Feedback
    if (typeof triggerPulse === 'function') triggerPulse(400, 'sine', 0.2);

    // Process all files in parallel
    const processedBatch = await Promise.all(
        Array.from(rawFiles).map(async (file) => {
            let currentFile = file;

            // 1. HEIC / RAW TRANSCODING
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                try {
                    const heic2any = (await import('heic2any')).default;
                    const blob: any = await heic2any({ 
                        blob: file, 
                        toType: 'image/jpeg',
                        quality: 0.7 
                    });
                    currentFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
                } catch (err) {
                    console.error("TRANSCODE_ERR", err);
                }
            }

            // 2. LOGISTICS SCALE COMPRESSION (> 5MB)
            if (currentFile.type.startsWith('image/') && currentFile.size > 5 * 1024 * 1024) {
                currentFile = await compressImage(currentFile);
            }

            // Return the wrapper object
            return {
                id: crypto.randomUUID(),
                file: currentFile,
                previewUrl: URL.createObjectURL(currentFile),
                progress: 0,
                timestamp: new Date().toLocaleTimeString(),
                category: activeCategory // Ensure your 'bol' or 'freight' tags are here
            };
        })
    );

    // CRITICAL: Atomic update. We send the whole batch at once to the parent state.
    // Replace your current onFileChange call with this:
    setUploadedFiles(prev => [...prev, ...processedBatch]);
};

const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1600; 
                let [w, h] = [img.width, img.height];
                if (w > MAX_WIDTH) { h *= MAX_WIDTH / w; w = MAX_WIDTH; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, w, h);
                canvas.toBlob((b) => {
                    resolve(new File([b!], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', 0.8);
            };
        };
    });
};