import { Form } from './components/Form';
import { ToastProvider } from './components/Toast';
import { UploaderProvider } from './hooks/useUploader';

function App() {
  return (
    <ToastProvider>
      <UploaderProvider>
        {/* FINAL UI FIX: Applying max-width and centering classes to the main application container */}
        {/* min-h-screen ensures full height; flex/justify/items centers content vertically and horizontally */}
        {/* max-w-4xl constrains the form width; mx-auto centers it horizontally */}
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-4xl mx-auto py-8">
             <Form />
          </div>
        </div>
      </UploaderProvider>
    </ToastProvider>
  );
}

export default App;