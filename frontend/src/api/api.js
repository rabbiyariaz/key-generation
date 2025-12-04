import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`  // e.g. https://your-railway.up.railway.app
  : '/api'                             // local dev fallback


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
