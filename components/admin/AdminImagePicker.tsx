import { cn } from '@/lib/utils';

export interface AdminImagePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
  previewAlt?: string;
}

export default function AdminImagePicker({
  label,
  value,
  onChange,
  placeholder = '/images/placeholder.png',
  helper,
  previewAlt = 'Preview',
}: AdminImagePickerProps) {
  const hasImage = Boolean(value?.trim());

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-admin-fg-primary">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="shrink-0 overflow-hidden rounded-lg border border-admin-border-subtle bg-admin-bg-subtle">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- Admin previews accept arbitrary image URLs; next/image rejects unconfigured remote hosts.
            <img
              src={value}
              alt={previewAlt}
              className="h-32 w-32 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center text-xs text-admin-fg-muted">No image</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-2 text-sm text-admin-fg-primary focus:outline-none focus:ring-2 focus:ring-admin-primary"
          />
          <div className="flex gap-2">
            {hasImage && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-lg border border-admin-border-subtle px-3 py-1.5 text-xs font-medium text-admin-danger hover:bg-admin-bg-subtle"
              >
                Clear
              </button>
            )}
          </div>
          {helper && <p className="text-xs text-admin-fg-muted">{helper}</p>}
        </div>
      </div>
    </div>
  );
}
