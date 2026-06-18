const variantClasses = {
  primary:
    'bg-gradient-to-r from-accent-600 to-accent-400 text-white hover:shadow-lg hover:shadow-accent/30',
  secondary: 'glass hover:bg-white/10 text-white',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:shadow-lg hover:shadow-rose/30',
  ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5',
  outline:
    'border border-white/20 text-gray-300 hover:bg-white/5 hover:border-white/40',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-300
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="h-4 w-4 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
