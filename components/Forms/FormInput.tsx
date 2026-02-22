interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  error,
  value,
  onChange,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="input-label">
        {label}
        {required && <span className="ml-1 text-brand-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
