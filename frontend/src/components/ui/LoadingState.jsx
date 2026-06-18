export default function LoadingState({ children = 'Carregando…' }) {
  return <div className="loading">{children}</div>;
}
