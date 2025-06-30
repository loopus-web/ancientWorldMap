import { useState, useEffect, useCallback, useRef } from 'react'
import RealisticMapRenderer from './RealisticMapRenderer'
import RealisticMiniMap from './RealisticMiniMap'
import MapLegend from './MapLegend'
import FeaturePanel from './FeaturePanel'
import MapSaveLoad from './MapSaveLoad'
import EventPanel from './EventPanel'
import ThemeSelector from './ThemeSelector'
import WeatherSystem from './WeatherSystem'
import { EventSystem } from '../utils/eventSystem'
import { worldThemes } from '../utils/worldThemes'

const RealisticMap = ({ onThemeChange }) => {
  const [viewPosition, setViewPosition] = useState({ x: -500, y: -375 })
  const [viewScale, setViewScale] = useState(0.8)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [mapData, setMapData] = useState(null)
  const [showLegend, setShowLegend] = useState(false)
  const [showFeaturePanel, setShowFeaturePanel] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [filters, setFilters] = useState({
    settlements: true,
    pois: true,
    routes: true,
    rivers: true
  })
  const [worldTheme, setWorldTheme] = useState('medieval')
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showEventPanel, setShowEventPanel] = useState(false)
  const [eventSystem, setEventSystem] = useState(null)
  const [recentEvents, setRecentEvents] = useState([])
  
  // États pour le marqueur du groupe joueur
  const [playerGroup, setPlayerGroup] = useState({ 
    x: 1000, 
    y: 750, 
    isMoving: false, 
    targetX: null, 
    targetY: null,
    movementSpeed: 30
  })
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    worldX: 0, 
    worldY: 0 
  })
  
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const movementIntervalRef = useRef(null)
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerDimensions({ width: rect.width, height: rect.height })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (mapData) {
      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerDimensions({ width: rect.width, height: rect.height })
        }
      }
      
      setTimeout(updateDimensions, 50)
      setTimeout(() => {
        updateDimensions()
        window.dispatchEvent(new Event('resize'))
      }, 200)
    }
  }, [mapData])

  useEffect(() => {
    const fetchMapData = async () => {
      const { RealisticMapGenerator } = await import('../utils/realisticMapGenerator')
      const generator = new RealisticMapGenerator(2000, 1500, Math.random(), worldTheme)
      const data = generator.generate()
      setMapData(data)
      
      // Initialiser le système d'événements
      const newEventSystem = new EventSystem(worldTheme)
      setEventSystem(newEventSystem)
      
      // Notifier le changement de thème au parent
      if (onThemeChange) {
        onThemeChange(worldTheme)
      }
      
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    }
    
    fetchMapData()
  }, [worldTheme, onThemeChange])

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - viewPosition.x, y: e.clientY - viewPosition.y })
  }, [viewPosition])

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setViewPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Fonction pour gérer le mouvement du groupe joueur
  const movePlayerGroup = useCallback(() => {
    if (!playerGroup.isMoving || !playerGroup.targetX || !playerGroup.targetY) return

    const dx = playerGroup.targetX - playerGroup.x
    const dy = playerGroup.targetY - playerGroup.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < playerGroup.movementSpeed) {
      setPlayerGroup(prev => ({
        ...prev,
        x: prev.targetX,
        y: prev.targetY,
        isMoving: false,
        targetX: null,
        targetY: null
      }))
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current)
        movementIntervalRef.current = null
      }
    } else {
      const ratio = playerGroup.movementSpeed / distance
      setPlayerGroup(prev => ({
        ...prev,
        x: prev.x + dx * ratio,
        y: prev.y + dy * ratio
      }))
    }
  }, [playerGroup])

  // Gestion du clic droit pour le menu contextuel
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    
    const rect = containerRef.current.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top
    
    const worldX = (screenX - viewPosition.x) / viewScale
    const worldY = (screenY - viewPosition.y) / viewScale
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      worldX,
      worldY
    })
  }, [viewPosition, viewScale])

  // Fonction pour déplacer le groupe vers une position
  const travelToPosition = useCallback((targetX, targetY) => {
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current)
    }

    setPlayerGroup(prev => ({
      ...prev,
      isMoving: true,
      targetX,
      targetY
    }))

    movementIntervalRef.current = setInterval(movePlayerGroup, 50)
    setContextMenu({ visible: false, x: 0, y: 0, worldX: 0, worldY: 0 })
  }, [movePlayerGroup])

  // Fermer le menu contextuel
  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, worldX: 0, worldY: 0 })
  }, [])

  // Effet pour gérer le mouvement
  useEffect(() => {
    if (playerGroup.isMoving) {
      movePlayerGroup()
    }
  }, [playerGroup.isMoving, movePlayerGroup])

  // Nettoyage de l'interval au démontage
  useEffect(() => {
    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current)
      }
    }
  }, [])

  // Mise à jour du système d'événements
  useEffect(() => {
    if (!eventSystem) return

    const eventInterval = setInterval(() => {
      eventSystem.update(1000) // Update toutes les secondes
      const events = eventSystem.getRecentEvents(5)
      setRecentEvents(events)
      
      // Créer de nouvelles routes commerciales basées sur les événements
      const activeRoutes = eventSystem.getActiveTradeRoutes()
      if (mapData && activeRoutes.length > 0) {
        // Logic pour ajouter des routes commerciales progressivement
        const allSettlements = [
          ...mapData.features.cities.map(c => ({ ...c, type: 'city' })),
          ...mapData.features.towns.map(t => ({ ...t, type: 'town' }))
        ]
        
        // Sélectionner deux villes aléatoires pour une nouvelle route
        if (Math.random() < 0.1 && allSettlements.length >= 2) {
          const from = allSettlements[Math.floor(Math.random() * allSettlements.length)]
          const to = allSettlements[Math.floor(Math.random() * allSettlements.length)]
          
          if (from !== to) {
            const { RealisticMapGenerator } = require('../utils/realisticMapGenerator')
            const generator = new RealisticMapGenerator(mapData.width, mapData.height, 0, worldTheme)
            generator.features = mapData.features
            
            if (generator.addTradeRoute(from, to, Date.now())) {
              setMapData({ ...mapData })
            }
          }
        }
      }
    }, 1000)

    return () => clearInterval(eventInterval)
  }, [eventSystem, mapData, worldTheme])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.2, Math.min(3, viewScale * delta))
    
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const worldX = (mouseX - viewPosition.x) / viewScale
    const worldY = (mouseY - viewPosition.y) / viewScale
    
    const newX = mouseX - worldX * newScale
    const newY = mouseY - worldY * newScale
    
    setViewScale(newScale)
    setViewPosition({ x: newX, y: newY })
  }, [viewScale, viewPosition])

  const zoomIn = useCallback(() => {
    const newScale = Math.min(3, viewScale * 1.2)
    setViewScale(newScale)
  }, [viewScale])

  const zoomOut = useCallback(() => {
    const newScale = Math.max(0.2, viewScale * 0.8)
    setViewScale(newScale)
  }, [viewScale])

  const resetView = useCallback(() => {
    setViewScale(0.8)
    setViewPosition({ x: -500, y: -375 })
    setSelectedFeature(null)
  }, [])

  const generateNewMap = useCallback(async () => {
    setMapData(null)
    const { RealisticMapGenerator } = await import('../utils/realisticMapGenerator')
    const generator = new RealisticMapGenerator(2000, 1500, Math.random(), worldTheme)
    const data = generator.generate()
    setMapData(data)
    
    // Réinitialiser le système d'événements
    const newEventSystem = new EventSystem(worldTheme)
    setEventSystem(newEventSystem)
    setRecentEvents([])
    
    resetView()
  }, [resetView, worldTheme])

  const handleFeatureHover = useCallback((feature, event) => {
    setHoveredFeature(feature)
    
    let content = ''
    if (feature.type === 'city') {
      content = `${feature.name} (City)\nPopulation: ${Math.floor(feature.population).toLocaleString()}`
    } else if (feature.type === 'town') {
      content = `${feature.name} (Town)\nPopulation: ${Math.floor(feature.population).toLocaleString()}`
    } else if (feature.type === 'village') {
      content = `${feature.name} (Village)\nPopulation: ${Math.floor(feature.population).toLocaleString()}`
    } else if (feature.type === 'poi') {
      content = `${feature.name}\nType: ${feature.type}`
    }
    
    // Obtenir les dimensions du conteneur
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return
    
    // Calculer la position relative au conteneur
    const relativeX = event.clientX - containerRect.left
    const relativeY = event.clientY - containerRect.top
    
    // Dimensions approximatives du tooltip
    const tooltipWidth = 260 // max-width du tooltip
    const tooltipHeight = 80 // hauteur approximative
    
    // Calculer la position avec ajustement pour éviter les débordements
    let x = relativeX + 15
    let y = relativeY - 15
    
    // Ajuster horizontalement si débordement
    if (x + tooltipWidth > containerRect.width) {
      x = relativeX - tooltipWidth - 15
    }
    
    // Ajuster verticalement si débordement
    if (y < 0) {
      y = relativeY + 25
    } else if (y + tooltipHeight > containerRect.height) {
      y = containerRect.height - tooltipHeight - 10
    }
    
    setTooltip({
      visible: true,
      x: Math.max(10, x),
      y: Math.max(10, y),
      content
    })
  }, [containerDimensions])

  const handleFeatureLeave = useCallback(() => {
    setHoveredFeature(null)
    setTooltip({ visible: false, x: 0, y: 0, content: '' })
  }, [])

  const handleFeatureClick = useCallback((feature) => {
    setSelectedFeature(feature)
    setShowFeaturePanel(true)
    console.log('Selected feature:', feature)
  }, [])

  const toggleLegend = useCallback(() => {
    setShowLegend(prev => !prev)
  }, [])

  const handleFilterChange = useCallback((filterType, enabled) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: enabled
    }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      })
    }
  }, [])

  const closeFeaturePanel = useCallback(() => {
    setSelectedFeature(null)
    setShowFeaturePanel(false)
  }, [])

  const toggleSaveLoad = useCallback(() => {
    setShowSaveLoad(prev => !prev)
  }, [])

  const handleLoadMap = useCallback(async (savedMapData) => {
    setMapData(savedMapData)
    resetView()
    setShowSaveLoad(false)
  }, [resetView])

  const handleViewportChange = useCallback((newPosition) => {
    setViewPosition(newPosition)
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', closeContextMenu)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', closeContextMenu)
    }
  }, [handleMouseMove, handleMouseUp, closeContextMenu])

  if (!mapData) {
    return (
      <div className="hex-map-container">
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-light)',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          <div>🗺️ Generating ancient map...</div>
          <div style={{ fontSize: '1rem', marginTop: '1rem', opacity: 0.8 }}>
                          Creating continents and kingdoms
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="hex-map-container"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <RealisticMapRenderer
        ref={rendererRef}
        mapData={mapData}
        viewPosition={viewPosition}
        viewScale={viewScale}
        containerDimensions={containerDimensions}
        selectedFeature={selectedFeature}
        filters={filters}
        playerGroup={playerGroup}
        onFeatureHover={handleFeatureHover}
        onFeatureLeave={handleFeatureLeave}
        onFeatureClick={handleFeatureClick}
      />

      <MapLegend
        visible={showLegend}
        onToggle={toggleLegend}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <WeatherSystem
        mapData={mapData}
        theme={worldTheme}
      />

      {showFeaturePanel && (
        <FeaturePanel
          feature={selectedFeature}
          onClose={closeFeaturePanel}
          theme={worldTheme}
        />
      )}

      {showEventPanel && (
        <EventPanel
          events={recentEvents}
          theme={worldTheme}
          visible={showEventPanel}
          onClose={() => setShowEventPanel(false)}
        />
      )}

      {showThemeSelector && (
        <ThemeSelector
          currentTheme={worldTheme}
          onThemeChange={(newTheme) => {
            setWorldTheme(newTheme)
            generateNewMap()
          }}
          visible={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      <MapSaveLoad
        mapData={mapData}
        onLoadMap={handleLoadMap}
        visible={showSaveLoad}
        onToggle={toggleSaveLoad}
      />
      
      <div className="controls">
        <button className="control-button" onClick={zoomIn}>
          🔍 Zoom +
        </button>
        <button className="control-button" onClick={zoomOut}>
          🔍 Zoom -
        </button>
        <button className="control-button" onClick={resetView}>
          🎯 Center
        </button>
        <button className="control-button" onClick={generateNewMap}>
          🗺️ New Map
        </button>
        <button className="control-button theme-button" onClick={() => setShowThemeSelector(true)}>
          {worldThemes[worldTheme]?.icon || '🌍'} Theme
        </button>
        <button className="control-button" onClick={() => setShowEventPanel(!showEventPanel)}>
          📜 Events {recentEvents.length > 0 && `(${recentEvents.length})`}
        </button>
        <button className="control-button" onClick={toggleFullscreen}>
          {isFullscreen ? '🪟 Window' : '🖥️ Fullscreen'}
        </button>
      </div>
      
      <RealisticMiniMap 
        mapData={mapData}
        viewPosition={viewPosition}
        viewScale={viewScale}
        mapWidth={mapData.width}
        mapHeight={mapData.height}
        onViewportChange={handleViewportChange}
      />
      
      {tooltip.visible && (
        <div
          className="poi-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            whiteSpace: 'pre-line'
          }}
        >
          {tooltip.content}
        </div>
      )}
      
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--blur-backdrop)',
            WebkitBackdropFilter: 'var(--blur-backdrop)',
            border: '1px solid var(--glass-border)',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 4px 16px rgba(26, 22, 18, 0.4)',
            minWidth: '140px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => travelToPosition(contextMenu.worldX, contextMenu.worldY)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-light)',
              cursor: 'pointer',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-bronze-20)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
            }}
          >
            🗺️ Travel here
          </button>
        </div>
      )}
      
      {selectedFeature && (
        <div 
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--blur-backdrop)',
            WebkitBackdropFilter: 'var(--blur-backdrop)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-light)',
            padding: '0.875rem 1.25rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 16px rgba(26, 22, 18, 0.4), inset 0 1px 0 rgba(248, 244, 230, 0.1)',
            textAlign: 'center',
            fontWeight: '500',
            zIndex: 900,
            minWidth: '240px'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <span style={{ fontSize: '1.125rem' }}>
              {selectedFeature.type === 'city' ? '🏛️' : 
               selectedFeature.type === 'town' ? '🏘️' : 
               selectedFeature.type === 'village' ? '🏠' : '📍'}
            </span>
            <span style={{ 
              fontSize: '1rem',
              background: 'linear-gradient(135deg, var(--accent-bronze), var(--accent-gold))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {selectedFeature.name}
            </span>
          </div>
          {selectedFeature.population && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-medium)',
              fontWeight: '400'
            }}>
                              {Math.floor(selectedFeature.population).toLocaleString()} inhabitants
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RealisticMap 