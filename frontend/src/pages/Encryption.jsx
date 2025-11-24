import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AESEncryption from '../components/AESEncryption'

function Encryption() {
  const navigate = useNavigate()
  const [key, setKey] = useState('')

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">AES Encryption / Decryption</h1>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Encryption Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter or paste your key here..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-slate-400 mt-2">
            Don't have a key? <button onClick={() => navigate('/generate')} className="text-blue-400 hover:text-blue-300">Generate one here</button>
          </p>
        </div>

        {key ? (
          <AESEncryption keyString={key} />
        ) : (
          <div className="bg-slate-800 p-12 rounded-lg border border-slate-700 text-center">
            <p className="text-slate-400">Please enter a key above to use encryption/decryption</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Encryption
