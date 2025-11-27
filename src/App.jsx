import { useState } from 'react'
import './App.css'
import Home from './components/pages/Home.jsx'
import Desk from './components/pages/Desk.jsx'
import Reports from './components/pages/Reports.jsx'
import Configuration from './components/pages/Configuration.jsx'
import AboutUs from './components/pages/AboutUs.jsx'
import Settings from './components/pages/Settings.jsx'
import Profile from './components/pages/Profile.jsx'
import Layout from './components/layout/Layout.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { PostureTimerProvider } from './contexts/PostureTimerContext.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('Home')
  const [heightPresets, setHeightPresets] = useState([
    { id: 1, name: "Sitting", height: 720, unit: "mm" },
    { id: 2, name: "Standing", height: 1100, unit: "mm" },
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [currentHeight, setCurrentHeight] = useState(750)
  const [deskId, setDeskId] = useState(null)
  const [deskName, setDeskName] = useState("Smart Desk")
  const [showDeskDialog, setShowDeskDialog] = useState(false)

  const renderPage = () => {
    switch(currentPage) {
      case 'Home': return <Home />
      case 'Desk': return <Desk heightPresets={heightPresets} isConnected={isConnected} setIsConnected={setIsConnected} currentHeight={currentHeight} setCurrentHeight={setCurrentHeight} deskId={deskId} setDeskId={setDeskId} deskName={deskName} setDeskName={setDeskName} showDeskDialog={showDeskDialog} setShowDeskDialog={setShowDeskDialog} />
      case 'Reports': return <Reports />
      case 'Configuration': return <Configuration heightPresets={heightPresets} setHeightPresets={setHeightPresets} />
      case 'About us': return <AboutUs />
      case 'Settings': return <Settings />
      case 'Profile': return <Profile />
      default: return <Home />
    }
  }

  return (
    <AuthProvider>
      <PostureTimerProvider>
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
          {renderPage()}
        </Layout>
      </PostureTimerProvider>
    </AuthProvider>
  )
}

export default App
