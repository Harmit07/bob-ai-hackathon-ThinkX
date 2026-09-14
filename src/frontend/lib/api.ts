import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: BASE })

export async function fetchAdvisory() {
  const { data } = await api.get('/api/advisor/')
  return data
}

export async function fetchHistory(hours = 48) {
  const { data } = await api.get(`/api/grid/history?hours=${hours}`)
  return data
}

export async function fetchForecast(hours = 24) {
  const { data } = await api.get(`/api/forecast/?hours=${hours}`)
  return data
}

export async function fetchEvents(hours = 6) {
  const { data } = await api.get(`/api/events/?hours=${hours}`)
  return data
}

export async function fetchUnderperformance() {
  const { data } = await api.get('/api/underperformance/')
  return data
}

export async function fetchNextBestActions() {
  const { data } = await api.get('/api/nba/')
  return data
}

export async function fetchGridStress() {
  const { data } = await api.get('/api/stress/')
  return data
}

export async function fetchOperatorBrief() {
  const { data } = await api.get('/api/brief/')
  return data
}

export async function fetchFinancialImpact() {
  const { data } = await api.get('/api/financial/')
  return data
}

export async function fetchHITLQueue(status?: string) {
  const url = status ? `/api/hitl/queue?status=${status}` : '/api/hitl/queue'
  const { data } = await api.get(url)
  return data
}
