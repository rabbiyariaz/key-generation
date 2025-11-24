import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NODE_WIDTH = 60
const HORIZONTAL_GAP = 40
const LEVEL_HEIGHT = 110

// Known nonterminal names (multi-character descriptive names)
const NONTERMINALS = ['Start', 'Terminal']

const parseRulesFallback = (ruleString) => {
  if (!ruleString || ruleString === 'Terminal') {
    return []
  }

  const rules = []
  
  // Split on " | " (with spaces on both sides) to separate multiple rules
  // This preserves '|' when it appears as a terminal character
  const nonterminalPattern = NONTERMINALS.join('|')
  // Look for pattern: " | " followed by a nonterminal name and arrow
  const ruleSeparator = new RegExp(`\\s\\|\\s(?=${nonterminalPattern}\\s*→)`, 'g')
  const segments = ruleString.split(ruleSeparator)

  segments.forEach(segment => {
    // Match: nonterminal → production
    // Nonterminals are multi-character descriptive names
    const match = segment.match(new RegExp(`(${nonterminalPattern})\\s*→\\s*(.+)`))
    if (match) {
      const symbol = match[1]
      // Split production by spaces, preserving each token (including '|' as a terminal)
      const production = match[2]
        .trim()
        .split(/\s+/)
        .filter(Boolean)
      rules.push({ symbol, production })
    }
  })

  return rules
}

const extractRules = (step) => {
  if (Array.isArray(step.rules_meta) && step.rules_meta.length) {
    return step.rules_meta.map(rule => ({
      symbol: rule.symbol,
      production: Array.isArray(rule.production) ? rule.production : [rule.production]
    }))
  }

  return parseRulesFallback(step.rule_applied)
}

const cloneTree = (node) => ({
  symbol: node.symbol,
  children: node.children ? node.children.map(cloneTree) : []
})

const shiftTree = (node, deltaX) => {
  node.x += deltaX
  if (node.children) {
    node.children.forEach(child => shiftTree(child, deltaX))
  }
}

const layoutTree = (node, depth = 0) => {
  const laidOut = {
    symbol: node.symbol,
    x: 0,
    y: depth * LEVEL_HEIGHT + 40,
    children: []
  }

  if (!node.children || node.children.length === 0) {
    laidOut.width = NODE_WIDTH
    return laidOut
  }

  const childLayouts = node.children.map(child => layoutTree(child, depth + 1))
  let totalWidth =
    childLayouts.reduce((sum, child) => sum + child.width, 0) +
    HORIZONTAL_GAP * (childLayouts.length - 1)

  totalWidth = Math.max(totalWidth, NODE_WIDTH)
  let cursor = -totalWidth / 2

  childLayouts.forEach(child => {
    const childCenter = cursor + child.width / 2
    shiftTree(child, childCenter)
    laidOut.children.push(child)
    cursor += child.width + HORIZONTAL_GAP
  })

  laidOut.width = totalWidth
  return laidOut
}

const computeBounds = (node, bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }) => {
  bounds.minX = Math.min(bounds.minX, node.x - 40)
  bounds.maxX = Math.max(bounds.maxX, node.x + 40)
  bounds.minY = Math.min(bounds.minY, node.y - 40)
  bounds.maxY = Math.max(bounds.maxY, node.y + 40)

  if (node.children) {
    node.children.forEach(child => computeBounds(child, bounds))
  }

  return bounds
}

function TreeNode({ node, level = 0 }) {
  // Terminal: single character that is NOT a known nonterminal
  const isTerminal = !node.symbol || (node.symbol.length === 1 && !NONTERMINALS.includes(node.symbol))
  const hasChildren = node.children && node.children.length > 0

  return (
    <g>
      <motion.circle
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: level * 0.05 }}
        cx={node.x}
        cy={node.y}
        r={20}
        fill={isTerminal ? '#10b981' : '#3b82f6'}
        stroke={isTerminal ? '#059669' : '#2563eb'}
        strokeWidth="2"
      />
      <text
        x={node.x}
        y={node.y + 5}
        textAnchor="middle"
        className="text-xs font-mono font-bold fill-white pointer-events-none"
      >
        {node.symbol || node}
      </text>

      {hasChildren && node.children.map((child, index) => (
        <g key={index}>
          <line
            x1={node.x}
            y1={node.y + 20}
            x2={child.x}
            y2={child.y - 20}
            stroke="#64748b"
            strokeWidth="2"
          />
          <TreeNode node={child} level={level + 1} />
        </g>
      ))}
    </g>
  )
}

function ParseTreeVisualization({ parseSteps }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState('steps')

  useEffect(() => {
    if (isPlaying && currentStep < parseSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (currentStep >= parseSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, parseSteps.length])

  const handlePlay = () => {
    if (currentStep >= parseSteps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const handleStepChange = (step) => {
    setCurrentStep(step)
    setIsPlaying(false)
  }

  const buildTree = () => {
    if (!parseSteps || parseSteps.length === 0) return null

    const root = { symbol: 'Start', children: [] }
    
    for (let i = 1; i < parseSteps.length; i++) {
      const step = parseSteps[i]
      const rules = extractRules(step)
      
      rules.forEach(rule => {
        if (!rule || !rule.symbol) return

        const children = (rule.production || []).map(sym => sym.trim()).filter(Boolean)
        
        const findAndExpand = (node) => {
          if (node.symbol === rule.symbol && (!node.children || node.children.length === 0)) {
            node.children = children.map(sym => ({
              symbol: sym,
              children: []
            }))
            return true
          }
          if (node.children) {
            return node.children.some(child => findAndExpand(child))
          }
          return false
        }
        
        findAndExpand(root)
      })
    }

    return root
  }

  const calculateTreeBounds = (node, x = 0, y = 0, bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }) => {
    // Update bounds with current node
    bounds.minX = Math.min(bounds.minX, x - 30)
    bounds.maxX = Math.max(bounds.maxX, x + 30)
    bounds.minY = Math.min(bounds.minY, y - 30)
    bounds.maxY = Math.max(bounds.maxY, y + 30)

    if (node.children && node.children.length > 0) {
      const spacing = Math.max(100, 120 - (y / 100) * 10)
      const totalWidth = (node.children.length - 1) * spacing
      const startX = x - totalWidth / 2

      node.children.forEach((child, index) => {
        const childX = startX + index * spacing
        const childY = y + 100
        calculateTreeBounds(child, childX, childY, bounds)
      })
    }

    return bounds
  }

  const renderSymbols = (symbols) => {
    return symbols.map((sym, idx) => {
      // Terminal: single character that is NOT a known nonterminal
      const isTerminal = sym.length === 1 && !NONTERMINALS.includes(sym)
      return (
        <motion.span
          key={idx}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: idx * 0.05 }}
          className={`inline-block px-3 py-1 mx-1 rounded-lg font-mono text-sm font-semibold border-2 ${
            isTerminal
              ? 'bg-green-900/50 border-green-500 text-green-400'
              : 'bg-blue-900/50 border-blue-500 text-blue-400'
          }`}
        >
          {sym}
        </motion.span>
      )
    })
  }

  const currentStepData = parseSteps[currentStep] || parseSteps[0]
  const tree = buildTree()

  // Calculate tree dimensions
  const getTreeHeight = (node) => {
    if (!node.children || node.children.length === 0) return 1
    return 1 + Math.max(...node.children.map(getTreeHeight))
  }

  const positionedTree = tree ? layoutTree(cloneTree(tree)) : null
  const bounds = positionedTree ? computeBounds(positionedTree) : { minX: -100, maxX: 100, minY: 0, maxY: 400 }
  const treeWidth = bounds.maxX - bounds.minX + 80
  const treeHeightPx = bounds.maxY - bounds.minY + 80
  const viewBox = `${bounds.minX - 40} ${bounds.minY - 40} ${treeWidth} ${treeHeightPx}`

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Parse Tree Visualization
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('steps')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'steps'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Stepwise
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tree View
          </button>
        </div>
      </div>

      {viewMode === 'steps' ? (
        <>
          {/* Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => handleStepChange(0)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
            >
              ⏮ Reset
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={parseSteps.length - 1}
                value={currentStep}
                onChange={(e) => handleStepChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <span className="text-slate-300 font-semibold">
              Step {currentStep + 1} / {parseSteps.length}
            </span>
          </div>

          {/* Current Step Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 bg-slate-900 rounded-lg border border-slate-600 mb-4"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Step {currentStepData.step}: {currentStepData.rule_applied}
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2 font-medium">Current Symbols:</p>
                <div className="flex flex-wrap gap-2">
                  {renderSymbols(currentStepData.symbols)}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2 font-medium">Result:</p>
                <div className="bg-slate-950 p-3 rounded border border-slate-700">
                  <pre className="text-green-400 font-mono text-sm">
                    <code>{currentStepData.result || '...'}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">All Steps:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {parseSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepChange(idx)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    idx === currentStep
                      ? 'bg-blue-900/50 border-blue-500 shadow-sm'
                      : 'bg-slate-700 border-slate-600 hover:border-blue-600 hover:shadow-sm'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">Step {step.step}</div>
                  <div className="text-sm text-slate-200 font-mono truncate">
                    {step.rule_applied}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div 
          className="bg-slate-900 p-6 rounded-lg border border-slate-600 w-full overflow-auto"
          style={{ minHeight: '500px' }}
        >
          {tree ? (
            <svg 
              width="100%" 
              height={treeHeightPx}
              viewBox={viewBox}
              preserveAspectRatio="xMidYMin meet"
            >
              <TreeNode node={positionedTree} />
            </svg>
          ) : (
            <div className="text-center text-slate-400 py-8">
              Unable to build tree structure
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ParseTreeVisualization
