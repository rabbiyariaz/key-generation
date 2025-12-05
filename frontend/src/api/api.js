// src/api/index.js (or wherever)
import axios from 'axios'

const raw = import.meta.env.VITE_API_URL ?? '';
const cleanBase = raw.replace(/\/+$/, ''); // remove trailing slash(es)
const API_PREFIX = '/api';
const API_BASE = cleanBase
  ? (cleanBase.endsWith(API_PREFIX) ? cleanBase : cleanBase + API_PREFIX)
  : API_PREFIX;



const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})


export const cfgApi = {
  getModes: async () => {
    const response = await api.get('/cfg/modes')
    return response.data
  },
  generateKey: async (modes, length = null) => {
    const response = await api.post('/cfg/generate', { modes, length })
    return response.data
  },
}

export const entropyApi = {
  calculate: async (text) => {
    const response = await api.post('/entropy/calculate', { text })
    return response.data
  },
}

export const aesApi = {
  encrypt: async (plaintext, key) => {
    const response = await api.post('/aes/encrypt', { plaintext, key })
    return response.data
  },
  decrypt: async (encrypted, nonce, key) => {
    const response = await api.post('/aes/decrypt', { encrypted, nonce, key })
    return response.data
  },
}
