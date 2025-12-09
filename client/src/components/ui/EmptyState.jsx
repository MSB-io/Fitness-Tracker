const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon size={32} className="text-muted" />
        </div>
      )}
      <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
      {description && <p className="text-muted mb-4 max-w-sm">{description}</p>}
      {action && action}
    </div>
  )
}

export default EmptyState
