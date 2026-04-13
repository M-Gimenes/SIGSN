/** Turnos: Manhã 6h–12h, Tarde 12h–18h, Noite 18h–6h (doc: máx. 3 agendamentos por data no mesmo turno). */
export function formatLocalDateYYYYMMDD(d) {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTurnoFromDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const h = d.getHours();
  if (h >= 6 && h < 12) return 'MANHA';
  if (h >= 12 && h < 18) return 'TARDE';
  return 'NOITE';
}

const DIA_INDEX = { DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6 };

export function isGuiaDisponivel(disponibilidade, dataVisita) {
  const d = dataVisita instanceof Date ? dataVisita : new Date(dataVisita);
  const diaSemana = d.getDay();
  const turnoVisita = getTurnoFromDate(d);

  return disponibilidade.split(',').some((slot) => {
    const [dia, turno] = slot.trim().split(' ');
    return DIA_INDEX[dia] === diaSemana && turno === turnoVisita;
  });
}
