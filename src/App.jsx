import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './components/pages/Home.jsx'
import Desk from './components/pages/Desk.jsx'
import Reports from './components/pages/Reports.jsx'
import Configuration from './components/pages/Configuration.jsx'
import AboutUs from './components/pages/AboutUs.jsx'
import Profile from './components/pages/Profile.jsx'
import Layout from './components/layout/Layout.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { PostureTimerProvider } from './contexts/PostureTimerContext.jsx'
import { DeskProvider } from './contexts/DeskContext.jsx'

function App() {
  const [heightPresets, setHeightPresets] = useState([
    { id: 1, name: "Sitting", height: 720, unit: "cm" },
    { id: 2, name: "Standing", height: 1100, unit: "cm" },
  ])

  return (
    <AuthProvider>
      <PostureTimerProvider>
        <DeskProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="desk" element={
                <Desk 
                  heightPresets={heightPresets}
                  setHeightPresets={setHeightPresets}
                />
              } />
              <Route path="reports" element={<Reports />} />
              <Route path="configuration" element={
                <Configuration 
                  heightPresets={heightPresets} 
                  setHeightPresets={setHeightPresets}
                />
              } />
              <Route path="about" element={<AboutUs />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </DeskProvider>
      </PostureTimerProvider>
    </AuthProvider>
  )
}

export default App
