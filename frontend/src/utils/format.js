export function formatDateOnly(value) {
  if (!value) return '—';
  return String(value).slice(0, 10);
}

export function formatDateTime(value) {
  if (!value) return '—';
  return String(value).replace('T', ' ').slice(0, 16);
}

export function formatCurrency(value) {
  if (value == null || value === '') return '—';
  return `R$ ${Number(value).toFixed(2)}`;
}

export function formatNumber(value, digits = 2) {
  return Number(value || 0).toFixed(digits);
}

export function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export function toDateTimeLocalValue(value) {
  if (!value) return '';
  return String(value).slice(0, 16);
}

export function statusBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return Boolean(value);
}
