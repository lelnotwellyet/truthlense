export default function VerifyForm({ onSubmit, children, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}
    </form>
  );
}
