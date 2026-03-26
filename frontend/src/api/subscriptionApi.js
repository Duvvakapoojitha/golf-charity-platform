import api from './axios'

export const getSubscriptionStatus = () => api.get('/subscriptions/status')
export const createCheckout = (data) => api.post('/subscriptions/checkout', data)
export const mockActivate = (data) => api.post('/subscriptions/mock-activate', data)
export const cancelSubscription = () => api.post('/subscriptions/cancel')
