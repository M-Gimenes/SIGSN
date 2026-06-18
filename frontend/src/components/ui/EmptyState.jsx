export default function EmptyState({ children, hint }) {
  return (
    <div className="empty">
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}
