import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:border-blood-500 placeholder:text-slate-400 text-white ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
