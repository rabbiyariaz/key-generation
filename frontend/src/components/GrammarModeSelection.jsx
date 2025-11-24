import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cfgApi } from '../api/api'

const modeColors = {
  numeric: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-500',
    text: 'text-blue-400',
    hover: 'hover:border-blue-400',
    icon: '🔢'
  },
  alphabetic: {
    bg: 'bg-green-900/30',
    border: 'border-green-500',
    text: 'text-green-400',
    hover: 'hover:border-green-400',
    icon: '🔤'
  },
  alphanumeric: {
    bg: 'bg-purple-900/30',
    border: 'border-purple-500',
    text: 'text-purple-400',
    hover: 'hover:border-purple-400',
    icon: '🔤'
  },
  symbolic: {
    bg: 'bg-orange-900/30',
    border: 'border-orange-500',
    text: 'text-orange-400',
    hover: 'hover:border-orange-400',
    icon: '🔣'
  }
}

function GrammarModeSelection({ onModeSelect, selectedModes }) {
  const [modes, setModes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const data = await cfgApi.getModes()
        setModes(data.modes)
      } catch (error) {
        console.error('Error fetching modes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchModes()
  }, [])

  const handleModeToggle = (modeId) => {
    const currentModes = selectedModes || []
    let newModes
    
    if (currentModes.includes(modeId)) {
      // Remove mode if already selected
      newModes = currentModes.filter(m => m !== modeId)
    } else {
      // Add mode
      newModes = [...currentModes, modeId]
    }
    
    // At least one mode must be selected
    if (newModes.length === 0) {
      return
    }
    
    onModeSelect(newModes)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-blue-400"></span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <h2 className="text-2xl font-semibold text-white mb-2">
        Select Grammar Modes (Multiple Selection)
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Select one or more modes to combine in key generation
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modes.map((mode, index) => {
          const colors = modeColors[mode.id] || modeColors.alphabetic
          const isSelected = selectedModes && selectedModes.includes(mode.id)
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <button
                onClick={() => handleModeToggle(mode.id)}
                className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? `${colors.border} ${colors.bg} shadow-lg`
                    : `border-slate-600 bg-slate-700 ${colors.hover} hover:shadow-md`
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{colors.icon}</div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isSelected ? colors.text : 'text-white'}`}>
                  {mode.name}
                </h3>
                <p className={`text-sm ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {mode.description}
                </p>
              </button>
            </motion.div>
          )
        })}
      </div>
      {selectedModes && selectedModes.length > 0 && (
        <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-600">
          <p className="text-sm text-slate-300">
            <span className="font-semibold">Selected:</span> {selectedModes.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default GrammarModeSelection
