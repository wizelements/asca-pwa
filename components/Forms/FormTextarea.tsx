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
      <label htmlFor={name} className="block font-semibold mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
