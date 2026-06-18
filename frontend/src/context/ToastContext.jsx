import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const TIMEOUT_MS = 3200;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, { error = false } = {}) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, error, ts: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), TIMEOUT_MS);
  }, []);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  const value = useMemo(() => ({ toast, showToast }), [toast, showToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
