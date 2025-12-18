const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = "" }) => {
  return (
    <h3 className={`text-lg font-semibold text-primary ${className}`}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = "" }) => {
  return <p className={`text-sm text-muted mt-1 ${className}`}>{children}</p>;
};

const CardContent = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

export default Card;
