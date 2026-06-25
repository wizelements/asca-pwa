import { cn } from '@/lib/utils';

export interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function AdminFormField({
  label,
  htmlFor,
  helper,
  error,
  required,
  children,
}: AdminFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-admin-fg-primary">
        {label}
        {required && <span className="ml-1 text-admin-danger">*</span>}
      </label>
      {children}
      {helper && !error && <p className="text-xs text-admin-fg-muted">{helper}</p>}
      {error && <p className="text-xs text-admin-danger">{error}</p>}
    </div>
  );
}
