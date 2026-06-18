import { useToast } from '../../context/ToastContext.jsx';

export default function Toast() {
  const { toast } = useToast();
  const classes = ['toast'];
  if (toast) classes.push('show');
  if (toast?.error) classes.push('error');
  return <div className={classes.join(' ')}>{toast?.message ?? ''}</div>;
}
