const PILL_VARIANTS = {
  ativo: 'pill-ativo',
  inativo: 'pill-concluido',
  concluido: 'pill-concluido',
  suspenso: 'pill-suspenso',
  MANHA: 'pill-manha',
  TARDE: 'pill-tarde',
  NOITE: 'pill-noite',
  Ativo: 'pill-ativo',
  Inativo: 'pill-concluido',
  Descoberta: 'pill-ativo',
  'Atualização': 'pill-suspenso',
};

export function pillClass(value) {
  return PILL_VARIANTS[value] || '';
}

export default function Pill({ value, label, variant }) {
  if (value == null || value === '') return '—';
  const text = label ?? String(value);
  const cls = variant ? `pill-${variant}` : pillClass(value);
  return <span className={`pill ${cls}`}>{text}</span>;
}
