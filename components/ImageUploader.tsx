import React, { useRef, useState } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageSelected: (image: UploadedImage) => void;
  selectedImage: UploadedImage | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const resizeImage = (file: File): Promise<{ base64: string, previewUrl: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Max dimension 1024px to ensure API payload stability and prevent 500 errors
          const MAX_SIZE = 1024; 

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
             reject(new Error("Canvas context not available"));
             return;
          }
          
          // Fill white background to handle transparent PNGs converting to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use JPEG 0.85 for good balance of quality and size
          const mimeType = 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, 0.85);
          const base64 = dataUrl.split(',')[1];
          
          resolve({
            base64,
            previewUrl: dataUrl,
            mimeType
          });
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    setIsProcessing(true);
    try {
        const { base64, previewUrl, mimeType } = await resizeImage(file);
        onImageSelected({
            file,
            previewUrl,
            base64,
            mimeType
        });
    } catch (err) {
        console.error("Image processing error:", err);
        alert("Failed to process image. Please try another one.");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!selectedImage ? (
        <div
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
            ${isProcessing ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <div className="flex flex-col items-center gap-4">
            {isProcessing ? (
               <div className="p-4">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
               </div>
            ) : (
                <>
                    <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    </div>
                    <div>
                    <p className="text-lg font-medium text-slate-700">Click or drop image here</p>
                    <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden shadow-md border border-slate-200">
          <img 
            src={selectedImage.previewUrl} 
            alt="Original" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               onClick={() => !isProcessing && fileInputRef.current?.click()}
               className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-medium hover:bg-white transition-colors shadow-sm"
             >
               Change Image
             </button>
          </div>
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Original
          </div>
          {isProcessing && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
          )}
        </div>
      )}
    </div>
  );
};