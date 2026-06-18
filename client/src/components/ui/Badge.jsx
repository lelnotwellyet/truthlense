const variantClasses = {
  credible: 'badge-credible',
  likely: 'badge-likely',
  uncertain: 'badge-uncertain',
  misleading: 'badge-misleading',
  topic:
    'inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent-300 border border-accent/20',
};

export default function Badge({ variant = 'uncertain', children, className = '' }) {
  return (
    <span className={`${variantClasses[variant] || variantClasses.uncertain} ${className}`}>
      {children}
    </span>
  );
}
