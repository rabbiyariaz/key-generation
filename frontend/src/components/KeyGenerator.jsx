import { useState } from 'react'
import { motion } from 'framer-motion'
import { cfgApi } from '../api/api'

function KeyGenerator({ modes, onKeyGenerated }) {
  const [key, setKey] = useState(null)
  const [loading, setLoading] = useState(false)
  const [length, setLength] = useState(16)

  const handleGenerate = async () => {
    if (!modes || modes.length === 0) {
      alert('Please select at least one mode')
      return
    }
    
    setLoading(true)
    try {
      const data = await cfgApi.generateKey(modes, length)
      setKey(data.key)
      onKeyGenerated(data.key, data.parse_steps)
    } catch (error) {
      console.error('Error generating key:', error)
      alert('Failed to generate key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Generate Key
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Key Length (optional)
        </label>
        <input
          type="number"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value) || 16)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !modes || modes.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2"></span>
            Generating...
          </>
        ) : (
          'Generate Key'
        )}
      </button>

      {key && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-600"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Generated Key:
          </label>
          <div className="bg-slate-950 p-3 rounded border border-slate-700 mb-3">
            <pre className="text-green-400 font-mono text-sm break-all whitespace-pre-wrap">
              <code>{key}</code>
            </pre>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(key)}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            📋 Copy Key
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default KeyGenerator
