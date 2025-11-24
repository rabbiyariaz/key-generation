import { motion } from 'framer-motion'

function TreeNode({ node, level = 0, isLast = false }) {
  const isTerminal = !node.symbol || node.symbol.length === 1 || !node.symbol.match(/^[A-Z]+$/)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        {/* Node */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: level * 0.1 }}
          className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-semibold ${
            isTerminal
              ? 'bg-green-100 border-green-400 text-green-800'
              : 'bg-blue-100 border-blue-400 text-blue-800'
          }`}
        >
          {node.symbol || node}
        </motion.div>

        {/* Connector Line */}
        {hasChildren && (
          <div className={`w-0.5 ${isLast ? 'h-6' : 'h-full'} bg-slate-400 mt-1`} />
        )}
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="ml-4 flex flex-col">
          {node.children.map((child, index) => (
            <div key={index} className="flex items-start">
              {/* Horizontal Line */}
              <div className="w-4 h-0.5 bg-slate-400 mt-4" />
              {/* Vertical Line */}
              {index < node.children.length - 1 && (
                <div className="absolute w-0.5 h-full bg-slate-400 ml-4" style={{ marginTop: '1rem' }} />
              )}
              <div className="ml-4">
                <TreeNode
                  node={child}
                  level={level + 1}
                  isLast={index === node.children.length - 1}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TreeVisualization({ parseSteps }) {
  // Build tree structure from parse steps
  const buildTree = (steps) => {
    if (!steps || steps.length === 0) return null

    const root = { symbol: 'S', children: [] }
    const nodeMap = { 'S': root }
    let currentLevel = [root]

    for (let i = 1; i < steps.length; i++) {
      const step = steps[i]
      const prevStep = steps[i - 1]
      const newLevel = []

      // Process each symbol in current step
      step.symbols.forEach((symbol, idx) => {
        const isTerminal = !symbol.match(/^[A-Z]+$/)
        
        if (isTerminal) {
          // Terminal node
          newLevel.push({ symbol, children: [] })
        } else {
          // Non-terminal - find parent
          const parent = currentLevel.find(p => p.symbol === symbol) || currentLevel[0]
          if (parent) {
            const newNode = { symbol, children: [] }
            if (!parent.children) parent.children = []
            parent.children.push(newNode)
            newLevel.push(newNode)
          }
        }
      })

      currentLevel = newLevel
    }

    return root
  }

  // Alternative: Build tree from derivation rules
  const buildTreeFromRules = (steps) => {
    if (!steps || steps.length === 0) return null

    const root = { symbol: 'S', children: [], step: 0 }
    const stack = [{ node: root, symbols: ['S'], stepIndex: 0 }]

    for (let i = 1; i < steps.length; i++) {
      const step = steps[i]
      const prevStep = steps[i - 1]
      
      // Parse rule applied
      const rules = step.rule_applied.split(' | ')
      rules.forEach(rule => {
        const match = rule.match(/(\w+)\s*→\s*(.+)/)
        if (match) {
          const [, parentSymbol, production] = match
          const children = production.trim().split(/\s+/)
          
          // Find parent node in tree
          const findNode = (node, symbol) => {
            if (node.symbol === symbol && (!node.children || node.children.length === 0)) {
              return node
            }
            if (node.children) {
              for (const child of node.children) {
                const found = findNode(child, symbol)
                if (found) return found
              }
            }
            return null
          }

          const parentNode = findNode(root, parentSymbol)
          if (parentNode) {
            parentNode.children = children.map(sym => ({
              symbol: sym,
              children: [],
              step: i
            }))
          }
        }
      })
    }

    return root
  }

  const tree = buildTreeFromRules(parseSteps)

  if (!tree) {
    return (
      <div className="text-center text-slate-600 py-8">
        No tree data available
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 overflow-x-auto">
      <h3 className="text-xl font-semibold text-slate-900 mb-4">Parse Tree Structure</h3>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <TreeNode node={tree} />
      </div>
    </div>
  )
}

export default TreeVisualization

