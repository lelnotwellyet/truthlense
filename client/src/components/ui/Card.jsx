export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        glass p-6
        ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl hover:shadow-accent/5 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
