import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import KeyGenerator from './pages/KeyGenerator'
import ParseTree from './pages/ParseTree'
import Encryption from './pages/Encryption'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<KeyGenerator />} />
          <Route path="/parse-tree" element={<ParseTree />} />
          <Route path="/encryption" element={<Encryption />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
