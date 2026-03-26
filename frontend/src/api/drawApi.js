import api from './axios'

export const getDraws = () => api.get('/draws')
export const getDraw = (id) => api.get(`/draws/${id}`)
export const getDrawWinners = (id) => api.get(`/draws/${id}/winners`)
export const createDraw = (data) => api.post('/draws', data)
export const simulateDraw = (id) => api.post(`/draws/${id}/simulate`)
export const publishDraw = (id) => api.post(`/draws/${id}/publish`)
