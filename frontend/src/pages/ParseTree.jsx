import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ParseTreeVisualization from '../components/ParseTreeVisualization'

function ParseTree() {
  const location = useLocation()
  const navigate = useNavigate()
  const [parseSteps, setParseSteps] = useState([])
  const [key, setKey] = useState('')

  useEffect(() => {
    // Try to get data from navigation state
    if (location.state?.parseSteps) {
      setParseSteps(location.state.parseSteps)
      setKey(location.state.key || '')
    } else {
      // Try to get from localStorage as fallback
      const savedData = localStorage.getItem('parseTreeData')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setParseSteps(data.parseSteps || [])
          setKey(data.key || '')
        } catch (e) {
          console.error('Error parsing saved data:', e)
        }
      }
    }
  }, [location])

  // Save to localStorage when data changes
  useEffect(() => {
    if (parseSteps.length > 0) {
      localStorage.setItem('parseTreeData', JSON.stringify({ parseSteps, key }))
    }
  }, [parseSteps, key])

  if (parseSteps.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 mb-4">No parse tree data available</p>
          <p className="text-slate-400 text-sm mb-6">Generate a key first to view its parse tree</p>
          <button
            onClick={() => navigate('/generate')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Key Generator
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/generate')}
            className="text-blue-400 hover:text-blue-300 mb-4 transition-colors flex items-center gap-2"
          >
            <span>←</span> Back to Key Generator
          </button>
          <h1 className="text-4xl font-bold text-white">Parse Tree Visualization</h1>
          {key && (
            <p className="text-slate-300 mt-2">
              Key: <code className="bg-slate-800 px-2 py-1 rounded text-green-400">{key}</code>
            </p>
          )}
        </div>

        <ParseTreeVisualization parseSteps={parseSteps} />
      </div>
    </div>
  )
}

export default ParseTree
