const ProgressBar = ({ value, max = 100, className = "", showLabel = false }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <span className="text-sm text-muted">{value}</span>
            <span className="text-sm text-muted">{max}</span>
          </>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
