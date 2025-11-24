import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { entropyApi } from '../api/api'

function EntropyIndicator({ text, onEntropyCalculated }) {
  const [entropy, setEntropy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState('red')
  const [maxEntropy] = useState(8.0)

  useEffect(() => {
    if (text) {
      calculateEntropy()
    }
  }, [text])

  const calculateEntropy = async () => {
    setLoading(true)
    try {
      const data = await entropyApi.calculate(text)
      setEntropy(data.entropy)
      setColor(data.color)
      if (onEntropyCalculated) {
        onEntropyCalculated(data.entropy)
      }
    } catch (error) {
      console.error('Error calculating entropy:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBarColor = (ratio) => {
    if (ratio < 0.4) return 'bg-red-500'
    if (ratio < 0.7) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getTextColor = (colorName) => {
    switch (colorName) {
      case 'red':
        return 'text-red-400'
      case 'yellow':
        return 'text-yellow-400'
      case 'green':
        return 'text-green-400'
      default:
        return 'text-slate-300'
    }
  }

  const getBgColor = (colorName) => {
    switch (colorName) {
      case 'red':
        return 'bg-red-900/20 border-red-500/50'
      case 'yellow':
        return 'bg-yellow-900/20 border-yellow-500/50'
      case 'green':
        return 'bg-green-900/20 border-green-500/50'
      default:
        return 'bg-slate-800 border-slate-600'
    }
  }

  const entropyRatio = entropy ? entropy / maxEntropy : 0
  const percentage = Math.min(entropyRatio * 100, 100)

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Key Entropy Indicator
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-lg text-blue-400"></span>
        </div>
      ) : entropy !== null ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Entropy Value Display */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`inline-block px-8 py-4 rounded-lg ${getBgColor(color)} border-2 ${getTextColor(color)} font-bold text-2xl`}
            >
              {entropy.toFixed(4)} bits
            </motion.div>
            <p className="text-slate-400 mt-2 text-sm">
              Maximum possible: {maxEntropy.toFixed(2)} bits
            </p>
          </div>

          {/* Color Bar Visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Low Entropy</span>
              <span>High Entropy</span>
            </div>
            
            {/* Background Bar */}
            <div className="relative h-6 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
              {/* Current Entropy Indicator */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${getBarColor(entropyRatio)}`}
              />
            </div>

            {/* Percentage Display */}
            <div className="text-center">
              <span className="text-slate-300 font-semibold">
                {percentage.toFixed(1)}% of maximum entropy
              </span>
            </div>
          </div>

          {/* Entropy Quality Indicator */}
          <div className={`p-4 rounded-lg border-2 ${getBgColor(color)}`}>
            <h3 className="text-lg font-semibold text-white mb-2">Entropy Quality:</h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className={`flex-1 h-3 rounded-full ${getBarColor(entropyRatio)}`} />
              <span className={`font-semibold ${getTextColor(color)}`}>
                {color === 'green' ? '✓ Excellent' :
                 color === 'yellow' ? '⚠ Good' :
                 '✗ Weak'}
              </span>
            </motion.div>
          </div>

          {/* Information */}
          <div className="text-sm text-slate-400 space-y-1 bg-slate-900 p-4 rounded-lg border border-slate-700">
            <p>• Shannon entropy measures the randomness of the key</p>
            <p>• Higher entropy indicates better cryptographic strength</p>
            <p>• A good key should have entropy close to the maximum</p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center text-slate-400 py-8">
          Generate a key to see entropy analysis
        </div>
      )}
    </div>
  )
}

export default EntropyIndicator
