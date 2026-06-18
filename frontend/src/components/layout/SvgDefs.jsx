export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="mark-seal" viewBox="0 0 120 120">
          <g transform="translate(60 60)">
            <circle r="54" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <circle r="48" fill="none" stroke="currentColor" strokeWidth=".75" strokeDasharray="1 3" />
            <text x="0" y="18" fontFamily="Cormorant Garamond, serif" fontWeight="500" fontSize="52" textAnchor="middle" fill="currentColor" letterSpacing="-1">
              S<tspan dx="2" fontStyle="italic">N</tspan>
            </text>
            <polygon points="0,-54 1.2,-49 4,-47 1.2,-45 0,-40 -1.2,-45 -4,-47 -1.2,-49" fill="currentColor" />
          </g>
        </symbol>
        <symbol id="ic-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3l9 9" /><path d="M5 10v9h5v-5h4v5h5v-9" />
        </symbol>
        <symbol id="ic-schedule" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" />
        </symbol>
        <symbol id="ic-caravan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="14" height="9" /><path d="M17 10h3l1 3v3h-4" /><circle cx="8" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
        </symbol>
        <symbol id="ic-constellation" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,18 8,9 14,14 19,5" />
          <circle cx="4" cy="18" r="1.4" fill="currentColor" />
          <circle cx="8" cy="9" r="1.4" fill="currentColor" />
          <circle cx="14" cy="14" r="1.4" fill="currentColor" />
          <circle cx="19" cy="5" r="1.4" fill="currentColor" />
        </symbol>
        <symbol id="ic-compass" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polygon points="12,5 14,12 12,19 10,12" fill="currentColor" stroke="none" />
        </symbol>
        <symbol id="ic-group" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" />
          <path d="M2 20c.7-3 3.5-5 6-5s5.3 2 6 5" /><path d="M14 19c.5-2 2.2-3.5 4.5-3.5" />
        </symbol>
        <symbol id="ic-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5c3-1 6-1 8 0v15c-2-1-5-1-8 0z" /><path d="M20 5c-3-1-6-1-8 0v15c2-1 5-1 8 0z" />
        </symbol>
        <symbol id="ic-telescope" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l10-3 7 2-3 10-10 3z" />
          <line x1="10" y1="13" x2="14" y2="16" /><line x1="10" y1="13" x2="7" y2="20" /><line x1="14" y1="16" x2="17" y2="20" />
        </symbol>
        <symbol id="ic-researcher" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="3.5" /><path d="M4 20c1-4 5-6 8-6s7 2 8 6" />
        </symbol>
        <symbol id="ic-project" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h6l2 2h10v11H3z" />
        </symbol>
        <symbol id="ic-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </symbol>
        <symbol id="ic-edit" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </symbol>
        <symbol id="ic-trash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
        </symbol>
        <symbol id="ic-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </symbol>
        <symbol id="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </symbol>
        <symbol id="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </symbol>
        <symbol id="ic-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="20" x2="21" y2="20" />
          <rect x="5" y="12" width="3" height="7" /><rect x="10.5" y="8" width="3" height="11" /><rect x="16" y="4" width="3" height="15" />
        </symbol>
        <symbol id="ic-filter" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 4 21 4 14 13 14 20 10 18 10 13" />
        </symbol>
      </defs>
    </svg>
  );
}
