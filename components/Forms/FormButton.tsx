interface FormButtonProps {
  children: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function FormButton({
  children,
  type = 'submit',
  loading,
  disabled,
  onClick,
}: FormButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="w-full px-6 py-3 font-bold text-white rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
      style={{ backgroundColor: 'var(--color-accent)' }}
    >
      {loading ? 'Sending...' : children}
    </button>
  );
}
