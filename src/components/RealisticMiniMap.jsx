import { memo, useMemo, useRef, useEffect, useCallback } from 'react'
import { getBiomeColor } from '../utils/realisticMapGenerator'

const RealisticMiniMap = memo(({ 
  mapData, 
  viewPosition, 
  viewScale, 
  mapWidth, 
  mapHeight, 
  onViewportChange 
}) => {
  const MINIMAP_WIDTH = 200
  const MINIMAP_HEIGHT = 150
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  const minimapData = useMemo(() => {
    if (!mapData) return null
    
    const stepX = Math.max(1, Math.floor(mapWidth / MINIMAP_WIDTH))
    const stepY = Math.max(1, Math.floor(mapHeight / MINIMAP_HEIGHT))
    
    const pixels = new Uint8ClampedArray(MINIMAP_WIDTH * MINIMAP_HEIGHT * 4)
    
    for (let y = 0; y < MINIMAP_HEIGHT; y++) {
      for (let x = 0; x < MINIMAP_WIDTH; x++) {
        const mapX = Math.floor((x / MINIMAP_WIDTH) * mapWidth)
        const mapY = Math.floor((y / MINIMAP_HEIGHT) * mapHeight)
        
        if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
          const idx = mapY * mapWidth + mapX
          const biome = mapData.biomeMap[idx]
          const elevation = mapData.elevationMap[idx]
          
          const color = getBiomeColor(biome)
          const pixelIndex = (y * MINIMAP_WIDTH + x) * 4
          
          const r = parseInt(color.slice(1, 3), 16)
          const g = parseInt(color.slice(3, 5), 16)
          const b = parseInt(color.slice(5, 7), 16)
          
          const elevationFactor = Math.max(0.5, elevation)
          
          pixels[pixelIndex] = r * elevationFactor
          pixels[pixelIndex + 1] = g * elevationFactor
          pixels[pixelIndex + 2] = b * elevationFactor
          pixels[pixelIndex + 3] = 200
        } else {
          const pixelIndex = (y * MINIMAP_WIDTH + x) * 4
          pixels[pixelIndex] = 245
          pixels[pixelIndex + 1] = 235
          pixels[pixelIndex + 2] = 210
          pixels[pixelIndex + 3] = 120
        }
      }
    }
    
    return pixels
  }, [mapData, mapWidth, mapHeight])
  
  const viewportRect = useMemo(() => {
    const scale = 1 / viewScale
    const width = (window.innerWidth * scale / mapWidth) * MINIMAP_WIDTH
    const height = (window.innerHeight * scale / mapHeight) * MINIMAP_HEIGHT
    
    const x = (-viewPosition.x * scale / mapWidth) * MINIMAP_WIDTH
    const y = (-viewPosition.y * scale / mapHeight) * MINIMAP_HEIGHT
    
    return { x, y, width, height }
  }, [viewPosition, viewScale, mapWidth, mapHeight])
  
  const renderMinimap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !minimapData) return
    
    const ctx = canvas.getContext('2d')
    
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT)
    
    const imageData = new ImageData(minimapData, MINIMAP_WIDTH, MINIMAP_HEIGHT)
    ctx.putImageData(imageData, 0, 0)
    
    if (mapData && mapData.features) {
      ctx.fillStyle = '#654321'
      
      mapData.features.cities.forEach(city => {
        const x = (city.x / mapWidth) * MINIMAP_WIDTH
        const y = (city.y / mapHeight) * MINIMAP_HEIGHT
        ctx.fillRect(x - 1, y - 1, 2, 2)
      })
      
      ctx.fillStyle = '#8b4513'
      mapData.features.towns.forEach(town => {
        const x = (town.x / mapWidth) * MINIMAP_WIDTH
        const y = (town.y / mapHeight) * MINIMAP_HEIGHT
        ctx.fillRect(x, y, 1, 1)
      })
    }
    
    ctx.strokeStyle = '#8b4513'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 2])
    ctx.strokeRect(
      Math.max(0, Math.min(MINIMAP_WIDTH - viewportRect.width, viewportRect.x)),
      Math.max(0, Math.min(MINIMAP_HEIGHT - viewportRect.height, viewportRect.y)),
      Math.min(MINIMAP_WIDTH, viewportRect.width),
      Math.min(MINIMAP_HEIGHT, viewportRect.height)
    )
    
    ctx.fillStyle = 'rgba(218, 165, 32, 0.2)'
    ctx.fillRect(
      Math.max(0, Math.min(MINIMAP_WIDTH - viewportRect.width, viewportRect.x)),
      Math.max(0, Math.min(MINIMAP_HEIGHT - viewportRect.height, viewportRect.y)),
      Math.min(MINIMAP_WIDTH, viewportRect.width),
      Math.min(MINIMAP_HEIGHT, viewportRect.height)
    )
  }, [minimapData, viewportRect, mapData, mapWidth, mapHeight])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = MINIMAP_WIDTH
    canvas.height = MINIMAP_HEIGHT
    
    renderMinimap()
  }, [renderMinimap])
  
  const handleClick = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const mapX = (x / MINIMAP_WIDTH) * mapWidth
    const mapY = (y / MINIMAP_HEIGHT) * mapHeight
    
    onViewportChange({
      x: -mapX + window.innerWidth / 2,
      y: -mapY + window.innerHeight / 2
    })
  }, [mapWidth, mapHeight, onViewportChange])
  
  if (!mapData) return null
  
  return (
    <div 
      ref={containerRef}
      className="minimap" 
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: MINIMAP_WIDTH,
        height: MINIMAP_HEIGHT,
        background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.9), rgba(101, 67, 33, 0.9))',
        border: '3px solid #8b4513',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        willChange: 'transform',
        boxShadow: '0 8px 24px rgba(101, 67, 33, 0.6), inset 0 2px 4px rgba(245, 235, 210, 0.3)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  )
})

RealisticMiniMap.displayName = 'RealisticMiniMap'

export default RealisticMiniMap 