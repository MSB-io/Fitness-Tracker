import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, className = "", type = "text", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2 border border-border rounded-lg bg-white text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
