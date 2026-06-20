'use client';

import { useId, useState } from 'react';

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

interface AdminImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  previewAlt?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read image file.'));
    image.src = src;
  });
}

async function optimizeImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }
  if (file.type === 'image/svg+xml') {
    throw new Error('SVG uploads are not supported here. Use JPG, PNG, or WebP.');
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('Image is too large. Choose an image under 8 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to optimize image in this browser.');
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminImageField({
  label,
  value,
  onChange,
  required,
  placeholder = '/images/gallery/event.jpg or https://...',
  helper = 'Paste an image path/URL, or upload a JPG/PNG/WebP. Uploads are optimized and stored with the record.',
  previewAlt = 'Image preview',
}: AdminImageFieldProps) {
  const textId = useId();
  const fileId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const dataUrl = await optimizeImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={textId} className="mb-1 block text-sm font-semibold text-brand-fg-primary">
          {label}{required ? ' *' : ''}
        </label>
        <input
          id={textId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
          required={required}
        />
        <p className="mt-1 text-xs text-brand-fg-muted">{helper}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          id={fileId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
        />
        <label
          htmlFor={fileId}
          className="inline-flex cursor-pointer justify-center rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle"
        >
          {uploading ? 'Optimizing image...' : 'Upload image'}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle"
          >
            Clear image
          </button>
        )}
      </div>

      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      {value && (
        <div className="rounded-lg border border-brand-border-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-fg-muted">Preview</p>
          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-brand-bg-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={previewAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
