import { useState } from 'react'
import RealisticMap from './components/RealisticMap'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="game-header">
        <h1>✦ Ancient World Map ✦</h1>
        <p>~ Cartography of Unknown Lands ~</p>
      </header>
      <RealisticMap />
    </div>
  )
}

export default App
