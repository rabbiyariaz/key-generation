import { useState } from 'react'
import { motion } from 'framer-motion'
import { aesApi } from '../api/api'

function AESEncryption({ keyString }) {
  const [plaintext, setPlaintext] = useState('')
  const [encrypted, setEncrypted] = useState('')
  const [nonce, setNonce] = useState('')
  const [decrypted, setDecrypted] = useState('')
  const [encrypting, setEncrypting] = useState(false)
  const [decrypting, setDecrypting] = useState(false)
  const [error, setError] = useState('')

  const handleEncrypt = async () => {
    if (!plaintext.trim()) {
      setError('Please enter text to encrypt')
      return
    }
    if (!keyString) {
      setError('Please generate a key first')
      return
    }

    setError('')
    setEncrypting(true)
    try {
      const data = await aesApi.encrypt(plaintext, keyString)
      setEncrypted(data.encrypted)
      setNonce(data.nonce)
      setDecrypted('') // Clear previous decryption
    } catch (error) {
      console.error('Encryption error:', error)
      setError('Encryption failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setEncrypting(false)
    }
  }

  const handleDecrypt = async () => {
    if (!encrypted || !nonce) {
      setError('Please encrypt text first')
      return
    }
    if (!keyString) {
      setError('Please generate a key first')
      return
    }

    setError('')
    setDecrypting(true)
    try {
      const data = await aesApi.decrypt(encrypted, nonce, keyString)
      setDecrypted(data.plaintext)
    } catch (error) {
      console.error('Decryption error:', error)
      setError('Decryption failed: ' + (error.response?.data?.detail || error.message))
    } finally {
      setDecrypting(false)
    }
  }

  const handleClear = () => {
    setPlaintext('')
    setEncrypted('')
    setNonce('')
    setDecrypted('')
    setError('')
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-2xl font-semibold text-white mb-4">
        AES Encryption / Decryption
      </h2>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Key Display */}
      <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Encryption Key:
        </label>
        <div className="bg-slate-950 p-3 rounded border border-slate-700">
          <pre className="text-green-400 font-mono text-xs break-all">
            <code>{keyString}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encryption Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Encryption
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Plaintext Input:
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter text to encrypt..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 h-32 resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleEncrypt}
            disabled={encrypting || !plaintext.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {encrypting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Encrypting...
              </>
            ) : (
              <>
                <span className="text-xl mr-2">🔐</span>
                Encrypt
              </>
            )}
          </button>

          {encrypted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">
                  Encrypted Output:
                </label>
                <div className="bg-slate-950 p-3 rounded border border-slate-700">
                  <pre className="text-green-400 font-mono text-xs break-all">
                    <code>{encrypted}</code>
                  </pre>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-2">
                  Nonce (Base64):
                </label>
                <div className="bg-slate-950 p-3 rounded border border-slate-700">
                  <pre className="text-yellow-400 font-mono text-xs break-all">
                    <code>{nonce}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Decryption Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-green-400 flex items-center gap-2">
            <span className="text-2xl">🔓</span>
            Decryption
          </h3>

          {encrypted && nonce ? (
            <>
              <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-300">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>Using encrypted data from above</span>
                </div>
              </div>

              <button
                onClick={handleDecrypt}
                disabled={decrypting || !encrypted || !nonce}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {decrypting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Decrypting...
                  </>
                ) : (
                  <>
                    <span className="text-xl mr-2">🔓</span>
                    Decrypt
                  </>
                )}
              </button>

              {decrypted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <label className="block text-sm font-medium text-blue-400 mb-2">
                    Decrypted Plaintext:
                  </label>
                  <div className="bg-slate-950 p-3 rounded border border-slate-700">
                    <pre className="text-blue-400 font-mono text-sm break-all whitespace-pre-wrap">
                      <code>{decrypted}</code>
                    </pre>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-600 rounded-lg">
              <p className="text-lg mb-2">🔒</p>
              <p>Encrypt text first to enable decryption</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Clear Button */}
      {(plaintext || encrypted || decrypted) && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            🗑️ Clear All
          </button>
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ About AES-GCM:</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• AES-GCM (Galois/Counter Mode) provides authenticated encryption</li>
          <li>• The nonce (number used once) ensures each encryption is unique</li>
          <li>• Both encrypted data and nonce are required for decryption</li>
          <li>• The key is derived from your generated CFG key using PBKDF2</li>
        </ul>
      </div>
    </div>
  )
}

export default AESEncryption
