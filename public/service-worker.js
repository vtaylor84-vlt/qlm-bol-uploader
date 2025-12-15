// public/service-worker.js

// Ensure idb-keyval is accessible by importing it
// NOTE: You MUST install the npm package 'idb-keyval' (npm install idb-keyval)
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

// Custom store configuration (must match useQueue.ts)
const submissionStore = idbKeyval.createStore('bol-uploader-db', 'submissions');

self.addEventListener('install', (event) => {
  // Activate service worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim control over un-controlled clients
  event.waitUntil(self.clients.claim());
});


self.addEventListener('sync', (event) => {
  if (event.tag === 'bol-sync') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  const keys = await idbKeyval.keys(submissionStore);
  
  if (keys.length === 0) {
    console.log('Sync complete: Queue is empty.');
    return;
  }
  
  console.log(`Starting sync for ${keys.length} job(s)...`);

  for (const key of keys) {
    const job = await idbKeyval.get(key, submissionStore);
    
    // Create FormData payload
    const formData = new FormData();
    
    // Append form data
    for (const [field, value] of Object.entries(job.data)) {
        formData.append(field, String(value));
    }
    
    // Append files (Blobs)
    job.files.forEach(f => {
        // Appending the Blob object with its original name and type
        formData.append('files', f.blob, f.name); 
    });

    try {
      // NOTE: Replace '/api/upload' with your actual backend endpoint URL
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      
      if (res.ok) {
        // SUCCESS: Delete from local IndexedDB
        await idbKeyval.del(key, submissionStore);
        console.log(`Successfully synced and deleted job: ${key}`);
        
        // Notify the client to update the queue count
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
        });

      } else {
        console.error(`Sync failed for job ${key}: Server error ${res.status}`);
        // If server returns an error, we stop and retry next sync cycle
        return; 
      }
    } catch (e) {
      console.error('Sync failed for job (Network Error)', key, e);
      // Stop sync: Network failure will trigger a retry on next sync event
      return; 
    }
  }
  
  // Final notification if the loop completed successfully
  self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
  });
}