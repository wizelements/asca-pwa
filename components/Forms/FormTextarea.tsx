interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function FormTextarea({
  label,
  name,
  placeholder,
  required,
  rows = 5,
  error,
  value,
  onChange,
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="input-label">
        {label}
        {required && <span className="ml-1 text-brand-danger">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
