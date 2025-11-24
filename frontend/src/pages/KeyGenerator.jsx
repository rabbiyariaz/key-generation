import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GrammarModeSelection from '../components/GrammarModeSelection'
import KeyGeneratorComponent from '../components/KeyGenerator'
import EntropyIndicator from '../components/EntropyIndicator'

function KeyGenerator() {
  const [selectedModes, setSelectedModes] = useState([])
  const [generatedKey, setGeneratedKey] = useState(null)
  const [parseSteps, setParseSteps] = useState([])
  const [entropy, setEntropy] = useState(null)
  const navigate = useNavigate()

  const handleModeSelect = (modes) => {
    setSelectedModes(modes)
    setGeneratedKey(null)
    setParseSteps([])
    setEntropy(null)
  }

  const handleKeyGenerated = (key, steps) => {
    setGeneratedKey(key)
    setParseSteps(steps)
    // Also save to localStorage for parse tree page
    localStorage.setItem('parseTreeData', JSON.stringify({ parseSteps: steps, key }))
  }

  const handleEntropyCalculated = (entropyValue) => {
    setEntropy(entropyValue)
  }

  const handleViewParseTree = () => {
    if (parseSteps.length > 0) {
      navigate('/parse-tree', { state: { parseSteps, key: generatedKey } })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Key Generation</h1>

        <div className="space-y-8">
          <GrammarModeSelection 
            onModeSelect={handleModeSelect}
            selectedModes={selectedModes}
          />

          {selectedModes && selectedModes.length > 0 && (
            <KeyGeneratorComponent 
              modes={selectedModes}
              onKeyGenerated={handleKeyGenerated}
            />
          )}

          {generatedKey && (
            <>
              <EntropyIndicator 
                key={generatedKey}
                text={generatedKey}
                onEntropyCalculated={handleEntropyCalculated}
              />

              {parseSteps.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                  <h2 className="text-2xl font-semibold text-white mb-4">Generated Key</h2>
                  <div className="bg-slate-900 p-4 rounded border border-slate-600 mb-4">
                    <code className="text-sm font-mono text-green-400 break-all">{generatedKey}</code>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleViewParseTree}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      View Parse Tree →
                    </button>
                    <button
                      onClick={() => navigate('/parse-tree')}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Open Parse Tree Page
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default KeyGenerator
