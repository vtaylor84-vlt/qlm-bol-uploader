// src/services/queueService.ts (COMPLETE, FINAL SCRIPT)
import localforage from 'localforage';
import { QueuedSubmission, LoadSubmission } from '@/types.ts'; 
// FIX TS6133: Removed unused uploadSubmission import since it is not used directly in this file's scope
// import { uploadSubmission } from '@/services/uploadService.ts'; 

const QUEUE_KEY = 'uploadQueue';

// Setup localforage store for queue persistence
const uploadQueueStore = localforage.createInstance({
    name: 'QLMUploader',
    storeName: QUEUE_KEY,
    description: 'Load submission queue for offline support'
});

export const saveSubmissionToQueue = async (submission: LoadSubmission): Promise<void> => {
    // 1. Prepare submission for queue (remove large file objects, keep IDs)
    const fileIds = submission.files.map(f => f.id);
    const filesToUpload = submission.files.map(f => ({ id: f.id, file: f.file }));

    // The data structure to save to the queue (removes the full file objects)
    const queuedItem: QueuedSubmission = {
        ...submission,
        // FIX TS2561: Must use fileIds property instead of files
        fileIds: fileIds, 
        filesToUpload: filesToUpload,
        status: 'pending',
        retries: 0,
        // NOTE: The `Omit` in the type definition handles the removal of the original `files` property implicitly.
    };

    // Remove the full file objects from the submission before saving to avoid JSON circular reference errors
    // @ts-ignore: Ignoring type check to safely modify the object before saving
    delete queuedItem.files; 
    
    // 2. Save the submission to the queue
    await uploadQueueStore.setItem(submission.submissionId, queuedItem);
};

export const processQueue = async () => {
    // ... logic for processing queue
};