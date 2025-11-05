import { useState } from 'react'
import './App.css'
import Home from './components/pages/Home.jsx'
import Desk from './components/pages/Desk.jsx'
import Reports from './components/pages/Reports.jsx'
import Configuration from './components/pages/Configuration.jsx'
import AboutUs from './components/pages/AboutUs.jsx'
import Help from './components/pages/Help.jsx'
import Settings from './components/pages/Settings.jsx'
import Profile from './components/pages/Profile.jsx'
import Layout from './components/layout/Layout.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('Home')

  const renderPage = () => {
    switch(currentPage) {
      case 'Home': return <Home />
      case 'Desk': return <Desk />
      case 'Reports': return <Reports />
      case 'Configuration': return <Configuration />
      case 'About us': return <AboutUs />
      case 'Help': return <Help />
      case 'Settings': return <Settings />
      case 'Profile': return <Profile />
      default: return <Home />
    }
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export default App
