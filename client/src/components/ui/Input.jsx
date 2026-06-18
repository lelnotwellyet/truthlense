import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, icon, type = 'text', className = '', ...rest },
  ref
) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-gray-400 h-5 w-5 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            input-field
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/20' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
});

export default Input;
