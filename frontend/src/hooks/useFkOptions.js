import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const cache = new Map();
const pending = new Map();

function fetchOnce(endpoint) {
  if (cache.has(endpoint)) return Promise.resolve(cache.get(endpoint));
  if (pending.has(endpoint)) return pending.get(endpoint);
  const promise = api
    .get(endpoint)
    .then((data) => {
      cache.set(endpoint, data || []);
      pending.delete(endpoint);
      return cache.get(endpoint);
    })
    .catch((err) => {
      pending.delete(endpoint);
      throw err;
    });
  pending.set(endpoint, promise);
  return promise;
}

export function clearFkCache(endpoint) {
  if (endpoint) cache.delete(endpoint);
  else cache.clear();
}

export function useFkOptions(endpoints) {
  const list = Array.isArray(endpoints) ? endpoints : [endpoints];
  const [state, setState] = useState({ loading: true, data: {}, error: null });
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    let cancelled = false;
    setState({ loading: true, data: {}, error: null });

    Promise.all(list.map((ep) => fetchOnce(ep).then((data) => [ep, data])))
      .then((entries) => {
        if (cancelled) return;
        const data = Object.fromEntries(entries);
        setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ loading: false, data: {}, error });
      });

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.join('|')]);

  return state;
}
