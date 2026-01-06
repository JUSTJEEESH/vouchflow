'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'vouchflow_videos');
      formData.append('folder', 'vouchflow/logos');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onChange(data.secure_url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Company Logo
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Logo preview"
            className="w-24 h-24 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-slate-50 dark:bg-slate-800/50"
        >
          <div className="flex flex-col items-center text-center">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Click to upload logo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  PNG, JPG up to 2MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
