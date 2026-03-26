import api from './axios'

export const getAdminUsers = () => api.get('/admin/users')
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`)
export const getAdminSubscriptions = () => api.get('/admin/subscriptions')
export const getAnalytics = () => api.get('/admin/analytics')
export const getWinners = () => api.get('/winners')
export const getPendingWinners = () => api.get('/winners/pending')
export const updateWinnerStatus = (id, data) => api.patch(`/winners/${id}/status`, data)
