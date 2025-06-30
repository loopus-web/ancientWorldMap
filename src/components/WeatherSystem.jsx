import { memo, useEffect, useState } from 'react'

const WeatherSystem = memo(({ mapData, theme }) => {
  const [weather, setWeather] = useState({
    type: 'clear',
    intensity: 0,
    wind: { x: 0, y: 0 }
  })
  
  const weatherTypes = {
    medieval: ['clear', 'rain', 'fog', 'storm', 'snow'],
    fantasy: ['clear', 'magical_storm', 'aurora', 'mist', 'ethereal_rain'],
    scifi: ['clear', 'radiation_storm', 'plasma_rain', 'electromagnetic', 'solar_flare'],
    steampunk: ['clear', 'smog', 'steam_fog', 'acid_rain', 'coal_dust']
  }
  
  const weatherIcons = {
    clear: '☀️',
    rain: '🌧️',
    fog: '🌫️',
    storm: '⛈️',
    snow: '❄️',
    magical_storm: '✨',
    aurora: '🌌',
    mist: '🌁',
    ethereal_rain: '💫',
    radiation_storm: '☢️',
    plasma_rain: '⚡',
    electromagnetic: '🌐',
    solar_flare: '☄️',
    smog: '🏭',
    steam_fog: '💨',
    acid_rain: '🧪',
    coal_dust: '🌑'
  }
  
  useEffect(() => {
    const updateWeather = () => {
      const types = weatherTypes[theme] || weatherTypes.medieval
      const newType = types[Math.floor(Math.random() * types.length)]
      
      setWeather({
        type: newType,
        intensity: Math.random(),
        wind: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2
        }
      })
    }
    
    // Changer la météo toutes les 30 secondes
    const interval = setInterval(updateWeather, 30000)
    updateWeather() // Initial weather
    
    return () => clearInterval(interval)
  }, [theme])
  
  return (
    <div className="weather-display">
      <div className="weather-icon">
        {weatherIcons[weather.type]}
      </div>
      <div className="weather-info">
        <div className="weather-type">
          {weather.type.replace(/_/g, ' ').toUpperCase()}
        </div>
        <div className="weather-intensity">
          Intensity: {Math.round(weather.intensity * 100)}%
        </div>
      </div>
      
      <style>{`
        .weather-display {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--glass-bg);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 100;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .weather-display:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }
        
        .weather-icon {
          font-size: 2rem;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }
        
        .weather-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .weather-type {
          font-family: 'Cinzel', serif;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-light);
          letter-spacing: 0.05em;
        }
        
        .weather-intensity {
          font-size: 0.75rem;
          color: var(--text-medium);
          opacity: 0.8;
        }
        
        @media (max-width: 768px) {
          .weather-display {
            top: auto;
            bottom: 1rem;
            padding: 0.5rem 1rem;
          }
          
          .weather-icon {
            font-size: 1.5rem;
          }
          
          .weather-type {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  )
})

WeatherSystem.displayName = 'WeatherSystem'
export default WeatherSystem