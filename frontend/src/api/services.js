import { api } from './client.js';

export function buildQueryString(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, v);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export const entityApi = {
  list: (entity) => api.get(`/${entity}`),
  get: (entity, id) => api.get(`/${entity}/${id}`),
  create: (entity, body) => api.post(`/${entity}`, body),
  update: (entity, id, body) => api.put(`/${entity}/${id}`, body),
  remove: (entity, id) => api.del(`/${entity}/${id}`),
};

export const reportApi = {
  fetch: (endpoint, filters) => api.get(`${endpoint}${buildQueryString(filters)}`),
};
