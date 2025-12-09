import { forwardRef } from "react"

const Select = forwardRef(({ label, error, options = [], className = "", placeholder, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-primary">{label}</label>}
      <select
        ref={ref}
        className={`w-full px-4 py-2 border border-border rounded-lg bg-white text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

Select.displayName = "Select"

export default Select
