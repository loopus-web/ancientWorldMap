import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OptimizedSingleCanvasRenderer from './OptimizedSingleCanvasRenderer'
import CanvasMiniMap from './CanvasMiniMap'
import FPSCounter from './FPSCounter'
import { generateWorldMap, getBiomeIcon, getPOIIcon } from '../utils/mapGenerator'

const useThrottledCallback = (callback, delay) => {
  const lastCall = useRef(0)
  const timeoutRef = useRef(null)
  
  return useCallback((...args) => {
    const now = Date.now()
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now()
        callback(...args)
      }, delay - (now - lastCall.current))
    }
  }, [callback, delay])
}

const useResizeObserver = (ref, callback) => {
  useEffect(() => {
    if (!ref.current) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        callback({ width, height })
      }
    })
    
    resizeObserver.observe(ref.current)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [callback])
}

const HexMap = () => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: -1000, y: -1000 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedHex, setSelectedHex] = useState(null)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  
  const mapRef = useRef(null)
  const containerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const isScrolling = useRef(false)
  
  const MAP_WIDTH = 120
  const MAP_HEIGHT = 100
  const HEX_WIDTH = 60
  const HEX_HEIGHT = 52
  
  const worldMap = useMemo(() => generateWorldMap(MAP_WIDTH, MAP_HEIGHT), [])
  
  const handleResize = useCallback((dimensions) => {
    setContainerDimensions(dimensions)
  }, [])
  
  useResizeObserver(containerRef, handleResize)
  
  const throttledSetPosition = useThrottledCallback((newPosition) => {
    setPosition(newPosition)
  }, 16)
  
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const delta = e.deltaY > 0 ? 0.92 : 1.08
      const newScale = Math.max(0.2, Math.min(4, scale * delta))
      
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const worldX = (mouseX - position.x) / scale
      const worldY = (mouseY - position.y) / scale
      
      const newX = mouseX - worldX * newScale
      const newY = mouseY - worldY * newScale
      
      setScale(newScale)
      setPosition({ x: newX, y: newY })
    })
  }, [scale, position])
  
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
      e.preventDefault()
    }
  }, [position])
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    e.preventDefault()
    isScrolling.current = true
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    
    throttledSetPosition(newPosition)
    
    setTimeout(() => {
      isScrolling.current = false
    }, 100)
  }, [isDragging, dragStart, throttledSetPosition])
  
  const handleMouseUp = useCallback((e) => {
    setIsDragging(false)
    isScrolling.current = false
    e.preventDefault()
  }, [])
  
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(4, prev * 1.3))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(0.2, prev / 1.3))
  }, [])
  
  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: -1000, y: -1000 })
    setSelectedHex(null)
  }, [])
  
  const handleHexHover = useCallback((hex, event) => {
    if (isScrolling.current) return
    
    if (hex.poi || hex.settlement) {
      const rect = containerRef.current.getBoundingClientRect()
      
      // Position relative au conteneur
      const relativeX = event.clientX - rect.left
      const relativeY = event.clientY - rect.top
      
      // Dimensions approximatives du tooltip
      const tooltipWidth = 260
      const tooltipHeight = 80
      
      // Calculer la position avec ajustement pour éviter les débordements
      let x = relativeX + 15
      let y = relativeY - 15
      
      // Ajuster horizontalement si débordement
      if (x + tooltipWidth > rect.width) {
        x = relativeX - tooltipWidth - 15
      }
      
      // Ajuster verticalement si débordement
      if (y < 0) {
        y = relativeY + 25
      } else if (y + tooltipHeight > rect.height) {
        y = rect.height - tooltipHeight - 10
      }
      
      setTooltip({
        visible: true,
        x: Math.max(10, x),
        y: Math.max(10, y),
        content: hex.poi?.name || hex.settlement?.name || ''
      })
    } else {
      setTooltip({ visible: false, x: 0, y: 0, content: '' })
    }
  }, [])
  
  const handleHexLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, content: '' })
  }, [])
  
  const handleHexClick = useCallback((hex) => {
    if (isScrolling.current) return
    setSelectedHex(hex)
  }, [])
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const wheelOptions = { passive: false, capture: true }
    const mouseOptions = { passive: false, capture: true }
    
    container.addEventListener('wheel', handleWheel, wheelOptions)
    container.addEventListener('mousedown', handleMouseDown, mouseOptions)
    window.addEventListener('mousemove', handleMouseMove, mouseOptions)
    window.addEventListener('mouseup', handleMouseUp, mouseOptions)
    
    return () => {
      container.removeEventListener('wheel', handleWheel, wheelOptions)
      container.removeEventListener('mousedown', handleMouseDown, mouseOptions)
      window.removeEventListener('mousemove', handleMouseMove, mouseOptions)
      window.removeEventListener('mouseup', handleMouseUp, mouseOptions)
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp])
  
  const mapContainerStyle = useMemo(() => ({
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  }), [isDragging])
  
  return (
    <div className="hex-map-container" ref={containerRef} style={mapContainerStyle}>
      <FPSCounter />
      <motion.div 
        className="controls"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button 
          className="control-button" 
          onClick={handleZoomIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Zoom +
        </motion.button>
        <motion.button 
          className="control-button" 
          onClick={handleZoomOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Zoom -
        </motion.button>
        <motion.button 
          className="control-button" 
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </motion.div>
      
      <OptimizedSingleCanvasRenderer
        worldMap={worldMap}
        viewPosition={position}
        viewScale={scale}
        containerDimensions={containerDimensions}
        selectedHex={selectedHex}
        onHexHover={handleHexHover}
        onHexLeave={handleHexLeave}
        onHexClick={handleHexClick}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* <CanvasMiniMap
          worldMap={worldMap}
          viewPosition={position}
          viewScale={scale}
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          onViewportChange={setPosition}
        /> */}
      </motion.div>
      
      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            className="poi-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HexMap 