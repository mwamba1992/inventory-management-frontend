// src/services/businessService.js

const API_BASE = '/business' // Adjust if you have a different base URL

export const fetchBusinesses = async () => {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export const createBusiness = async (payload) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export const updateBusiness = async (id, payload) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export const deleteBusiness = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}
