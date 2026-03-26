import api from './axios'

export const getCharities = (search) => api.get('/charities', { params: search ? { search } : {} })
export const getCharity = (id) => api.get(`/charities/${id}`)
export const createCharity = (data) => api.post('/charities', data)
export const updateCharity = (id, data) => api.put(`/charities/${id}`, data)
export const deleteCharity = (id) => api.delete(`/charities/${id}`)
