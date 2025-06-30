import { useState } from 'react'
import RealisticMap from './components/RealisticMap'
import './App.css'

function App() {
  const [worldTitle, setWorldTitle] = useState('Ancient World Map')
  const [worldSubtitle, setWorldSubtitle] = useState('Cartography of Unknown Lands')

  const handleThemeChange = (theme) => {
    const titles = {
      medieval: { title: 'Medieval Kingdoms', subtitle: 'Age of Knights and Castles' },
      fantasy: { title: 'Enchanted Realms', subtitle: 'Where Magic Shapes the World' },
      scifi: { title: 'Galactic Frontier', subtitle: 'Exploring the Future Colonies' },
      steampunk: { title: 'Clockwork Empire', subtitle: 'Steam-Powered Civilization' }
    }
    
    const themeData = titles[theme] || titles.medieval
    setWorldTitle(themeData.title)
    setWorldSubtitle(themeData.subtitle)
  }

  return (
    <div className="App">
      <header className="game-header">
        <h1>✦ {worldTitle} ✦</h1>
        <p>~ {worldSubtitle} ~</p>
      </header>
      <RealisticMap onThemeChange={handleThemeChange} />
    </div>
  )
}

export default App
