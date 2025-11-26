import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { transformImage } from './services/geminiService';
import { AppState, UploadedImage } from './types';

const DEFAULT_PROMPT = "Verwandel diese Waldpilzbild in eine haarige Plüschwelt";

const InstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V1.5m0 0L8.25 5.25M12 1.5l3.75 3.75" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Install App on Mac</h3>
        <p className="text-slate-600 mt-2 text-sm">Run this web app like a native application.</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
             <span className="font-semibold text-slate-800">Safari</span>
          </div>
          <p className="text-sm text-slate-600">
            Go to <span className="font-medium text-slate-800">File</span> {'>'} <span className="font-medium text-slate-800">Add to Dock...</span>
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
             <span className="font-semibold text-slate-800">Chrome / Edge</span>
          </div>
          <p className="text-sm text-slate-600">
            Click the <span className="font-medium text-slate-800">Install icon</span> in the address bar, or go to <span className="font-medium text-slate-800">Menu</span> {'>'} <span className="font-medium text-slate-800">Save and Share</span> {'>'} <span className="font-medium text-slate-800">Install...</span>
          </p>
        </div>
      </div>
      
      <button 
        onClick={onClose}
        className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        Got it
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleImageSelected = (image: UploadedImage) => {
    setSelectedImage(image);
    setResultImage(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setAppState(AppState.LOADING);
    setError(null);

    try {
      const generatedImageBase64 = await transformImage(
        selectedImage.base64,
        selectedImage.mimeType,
        prompt
      );
      setResultImage(generatedImageBase64);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setError(err.message || "Something went wrong during generation.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Install Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={() => setShowInstallModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-white hover:shadow-md transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 9.75V1.5m0 0L8.25 5.25M12 1.5l3.75 3.75" />
          </svg>
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      </div>

      {showInstallModal && <InstallModal onClose={() => setShowInstallModal(false)} />}

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-2">
            Plushy <span className="text-indigo-600">Transformer</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload any image and turn it into a soft, hairy plush world using the power of Gemini AI.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Input Section */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col gap-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
                    Upload Image
                </h2>
                <ImageUploader 
                    onImageSelected={handleImageSelected} 
                    selectedImage={selectedImage}
                />
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
                    Customize Prompt
                </h2>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-700 bg-slate-50"
                    placeholder="Describe how you want to change the image..."
                />
                <p className="text-xs text-slate-500 mt-2">
                   Tip: The default prompt is set to transform mushrooms into plushies!
                </p>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!selectedImage || appState === AppState.LOADING}
                className={`
                    w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                    ${!selectedImage || appState === AppState.LOADING
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
                    }
                `}
            >
                {appState === AppState.LOADING ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Transforming...
                    </span>
                ) : 'Transform Image'}
            </button>
            
            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">3</span>
                Result
            </h2>
            <ResultDisplay 
                imageUrl={resultImage} 
                isLoading={appState === AppState.LOADING} 
            />
            {resultImage && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100">
                    <p className="font-semibold mb-1">Did you know?</p>
                    <p>You can change the prompt on the left to create different styles, like "origami world" or "cyberpunk style".</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;