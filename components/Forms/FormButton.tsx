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
      className="btn-primary w-full"
    >
      {loading ? 'Sending...' : children}
    </button>
  );
}
