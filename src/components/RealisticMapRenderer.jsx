import { memo, useRef, useEffect, useCallback, useMemo } from 'react'
import { RealisticMapGenerator, getBiomeColor } from '../utils/realisticMapGenerator'

const RealisticMapRenderer = memo(({ 
  mapData,
  viewPosition, 
  viewScale, 
  containerDimensions,
  selectedFeature,
  filters = { settlements: true, pois: true, routes: true, rivers: true },
  playerGroup,
  onFeatureHover,
  onFeatureLeave,
  onFeatureClick
}) => {
  const canvasRef = useRef(null)
  const offscreenCanvasRef = useRef(null)
  const renderRequestRef = useRef(null)
  const lastRenderParamsRef = useRef({})
  const mapCacheRef = useRef(null)
  const mapDataRef = useRef(null)
  
  const mapDimensions = useMemo(() => ({
    width: 2000,
    height: 1500
  }), [])

  const generateMap = useCallback(() => {
    if (mapData) {
      mapDataRef.current = mapData
      return mapData
    }
    
    if (mapDataRef.current) return mapDataRef.current
    
    const generator = new RealisticMapGenerator(mapDimensions.width, mapDimensions.height)
    const generatedMapData = generator.generate()
    mapDataRef.current = generatedMapData
    return generatedMapData
  }, [mapData, mapDimensions])

  const createParchmentTexture = useCallback((ctx, width, height) => {
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    gradient.addColorStop(0, 'rgba(250, 240, 220, 0.15)')
    gradient.addColorStop(0.7, 'rgba(240, 225, 195, 0.1)')
    gradient.addColorStop(1, 'rgba(220, 200, 160, 0.2)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.03})`
      const size = Math.random() * 3 + 0.5
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        size,
        size
      )
    }
    
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(101, 67, 33, ${Math.random() * 0.05})`
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = Math.random() * 8 + 2
      
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [])

  const renderBiomeLayer = useCallback((ctx, mapData) => {
    const imageData = ctx.createImageData(mapDimensions.width, mapDimensions.height)
    const data = imageData.data
    
    for (let y = 0; y < mapDimensions.height; y++) {
      for (let x = 0; x < mapDimensions.width; x++) {
        const idx = y * mapDimensions.width + x
        const pixelIdx = idx * 4
        
        const biome = mapData.biomeMap[idx]
        const elevation = mapData.elevationMap[idx]
        const moisture = mapData.moistureMap[idx]
        const temperature = mapData.temperatureMap[idx]
        
        const baseColor = getBiomeColor(biome)
        
        let r = parseInt(baseColor.slice(1, 3), 16)
        let g = parseInt(baseColor.slice(3, 5), 16)
        let b = parseInt(baseColor.slice(5, 7), 16)
        
        const elevationFactor = Math.max(0.7, Math.min(1.3, 0.85 + elevation * 0.45))
        
        r = Math.min(255, Math.floor(r * elevationFactor))
        g = Math.min(255, Math.floor(g * elevationFactor))
        b = Math.min(255, Math.floor(b * elevationFactor))
        
        data[pixelIdx] = r
        data[pixelIdx + 1] = g
        data[pixelIdx + 2] = b
        data[pixelIdx + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [mapDimensions])

  const renderRivers = useCallback((ctx, mapData) => {
    mapData.features.rivers.forEach((river, index) => {
      if (river.length < 2) return
      
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(0, 20, 40, 0.8)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      for (let pass = 0; pass < 3; pass++) {
        ctx.beginPath()
        
        if (pass === 0) {
          ctx.strokeStyle = 'rgba(0, 25, 50, 0.7)'
          ctx.lineWidth = Math.max(5, river.length / 25)
        } else if (pass === 1) {
          ctx.strokeStyle = 'rgba(40, 100, 160, 0.9)'
          ctx.lineWidth = Math.max(4, river.length / 35)
        } else {
          ctx.strokeStyle = 'rgb(80, 170, 240)'
          ctx.lineWidth = Math.max(3, river.length / 45)
        }
        
        ctx.moveTo(river[0].x, river[0].y)
        
        if (river.length > 2) {
          for (let i = 1; i < river.length - 1; i++) {
            const current = river[i]
            const next = river[i + 1]
            const midX = (current.x + next.x) / 2
            const midY = (current.y + next.y) / 2
            ctx.quadraticCurveTo(current.x, current.y, midX, midY)
          }
          ctx.lineTo(river[river.length - 1].x, river[river.length - 1].y)
        } else {
          for (let i = 1; i < river.length; i++) {
            ctx.lineTo(river[i].x, river[i].y)
          }
        }
        
        ctx.stroke()
      }
      
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })
  }, [])

  const renderTradeRoutes = useCallback((ctx, mapData) => {
    if (!mapData.features.roads) return
    
    mapData.features.roads.forEach(road => {
      if (!road.path || road.path.length < 2) return
      
      const isMajor = road.type === 'major'
      
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 1
      
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath()
        ctx.moveTo(road.path[0].x, road.path[0].y)
        
        if (pass === 0) {
          ctx.strokeStyle = isMajor ? 'rgba(101, 67, 33, 0.6)' : 'rgba(101, 67, 33, 0.4)'
          ctx.lineWidth = isMajor ? 4 : 3
        } else {
          ctx.strokeStyle = isMajor ? 'rgba(139, 115, 85, 0.9)' : 'rgba(139, 115, 85, 0.7)'
          ctx.lineWidth = isMajor ? 2 : 1.5
        }
        
        ctx.setLineDash(isMajor ? [] : [6, 4])
        
        for (let i = 1; i < road.path.length; i++) {
          ctx.lineTo(road.path[i].x, road.path[i].y)
        }
        
        ctx.stroke()
      }
      
      ctx.setLineDash([])
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })
  }, [])

  const renderElevationShading = useCallback((ctx, mapData) => {
    const shadowImageData = ctx.createImageData(mapDimensions.width, mapDimensions.height)
    const shadowData = shadowImageData.data
    
    for (let y = 1; y < mapDimensions.height - 1; y++) {
      for (let x = 1; x < mapDimensions.width - 1; x++) {
        const idx = y * mapDimensions.width + x
        const pixelIdx = idx * 4
        
        const elevation = mapData.elevationMap[idx]
        const elevationRight = mapData.elevationMap[idx + 1]
        const elevationDown = mapData.elevationMap[idx + mapDimensions.width]
        
        const gradientX = (elevationRight - elevation) * 2
        const gradientY = (elevationDown - elevation) * 2
        
        const lightDirection = { x: -0.707, y: -0.707 }
        const dotProduct = gradientX * lightDirection.x + gradientY * lightDirection.y
        
        const shading = Math.max(0, Math.min(1, 0.5 + dotProduct * 0.5))
        const shadowIntensity = (1 - shading) * 0.15
        
        shadowData[pixelIdx] = 0
        shadowData[pixelIdx + 1] = 0
        shadowData[pixelIdx + 2] = 0
        shadowData[pixelIdx + 3] = shadowIntensity * 255
      }
    }
    
    ctx.globalCompositeOperation = 'multiply'
    ctx.putImageData(shadowImageData, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
  }, [mapDimensions])

  const renderSettlements = useCallback((ctx, mapData) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    mapData.features.cities.forEach(city => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      ctx.fillStyle = '#8b4513'
      ctx.beginPath()
      ctx.arc(city.x, city.y, 8, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#daa520'
      ctx.beginPath()
      ctx.arc(city.x, city.y, 6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#654321'
      ctx.font = 'bold 16px serif'
      ctx.fillText('🏛️', city.x, city.y)
      
      ctx.shadowBlur = 2
      ctx.fillStyle = '#2c1810'
      ctx.font = 'bold 11px serif'
      ctx.fillText(city.name, city.x, city.y + 22)
    })
    
    mapData.features.towns.forEach(town => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 2
      
      ctx.fillStyle = '#8b4513'
      ctx.beginPath()
      ctx.arc(town.x, town.y, 6, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#cd853f'
      ctx.beginPath()
      ctx.arc(town.x, town.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#654321'
      ctx.font = 'bold 14px serif'
      ctx.fillText('🏘️', town.x, town.y)
      
      ctx.fillStyle = '#2c1810'
      ctx.font = 'bold 9px serif'
      ctx.fillText(town.name, town.x, town.y + 18)
    })
    
    mapData.features.villages.forEach(village => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 1
      
      ctx.fillStyle = '#8b4513'
      ctx.beginPath()
      ctx.arc(village.x, village.y, 3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#654321'
      ctx.font = 'bold 12px serif'
      ctx.fillText('🏠', village.x, village.y)
    })
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }, [])

  const renderPOIs = useCallback((ctx, mapData) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const poiIcons = {
      ruin: '⚱️',
      mine: '⚒️',
      temple: '⛩️',
      tower: '🗼',
      cave: '🕳️'
    }
    
    mapData.features.pois.forEach(poi => {
      const icon = poiIcons[poi.type] || '✦'
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      ctx.fillStyle = 'rgba(139, 115, 85, 0.6)'
      ctx.beginPath()
      ctx.arc(poi.x, poi.y, 4, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillStyle = '#654321'
      ctx.font = 'bold 12px serif'
      ctx.fillText(icon, poi.x, poi.y)
    })
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }, [])

  const renderCoastlines = useCallback((ctx, mapData) => {
    for (let y = 1; y < mapDimensions.height - 1; y++) {
      for (let x = 1; x < mapDimensions.width - 1; x++) {
        const idx = y * mapDimensions.width + x
        const elevation = mapData.elevationMap[idx]
        const biome = mapData.biomeMap[idx]
        
        if ((elevation > 0.08 && elevation < 0.18) || biome === 'coast') {
          let hasWaterNeighbor = false
          let hasLandNeighbor = false
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const nx = x + dx
              const ny = y + dy
              if (nx >= 0 && nx < mapDimensions.width && ny >= 0 && ny < mapDimensions.height) {
                const neighborIdx = ny * mapDimensions.width + nx
                const neighborElevation = mapData.elevationMap[neighborIdx]
                if (neighborElevation < 0.1) {
                  hasWaterNeighbor = true
                } else if (neighborElevation > 0.15) {
                  hasLandNeighbor = true
                }
              }
            }
          }
          
          if (hasWaterNeighbor && hasLandNeighbor) {
            ctx.fillStyle = 'rgba(218, 165, 32, 0.6)'
            ctx.fillRect(x, y, 1, 1)
          } else if (hasWaterNeighbor) {
            ctx.fillStyle = 'rgba(139, 115, 85, 0.4)'
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }
  }, [mapDimensions])

  const generateFullMap = useCallback(() => {
    if (mapCacheRef.current) return

    const mapData = generateMap()
    
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = mapDimensions.width
    offscreenCanvas.height = mapDimensions.height
    const ctx = offscreenCanvas.getContext('2d')
    
    renderBiomeLayer(ctx, mapData)
    
    renderCoastlines(ctx, mapData)
    
    ctx.globalCompositeOperation = 'overlay'
    ctx.globalAlpha = 0.1
    createParchmentTexture(ctx, mapDimensions.width, mapDimensions.height)
    ctx.globalAlpha = 1.0
    ctx.globalCompositeOperation = 'source-over'
    
    if (filters.rivers) {
      renderRivers(ctx, mapData)
    }
    
    if (filters.routes) {
      renderTradeRoutes(ctx, mapData)
    }
    
    ctx.shadowColor = 'rgba(101, 67, 33, 0.4)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    
    if (filters.settlements) {
      renderSettlements(ctx, mapData)
    }
    
    if (filters.pois) {
      renderPOIs(ctx, mapData)
    }
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    const borderGradient = ctx.createLinearGradient(0, 0, mapDimensions.width, mapDimensions.height)
    borderGradient.addColorStop(0, 'rgba(101, 67, 33, 0.8)')
    borderGradient.addColorStop(1, 'rgba(139, 115, 85, 0.6)')
    
    ctx.strokeStyle = borderGradient
    ctx.lineWidth = 6
    ctx.strokeRect(0, 0, mapDimensions.width, mapDimensions.height)
    
    offscreenCanvasRef.current = offscreenCanvas
    mapCacheRef.current = true
  }, [mapDimensions, generateMap, createParchmentTexture, renderBiomeLayer, renderElevationShading, renderCoastlines, renderRivers, renderTradeRoutes, renderSettlements, renderPOIs, JSON.stringify(filters)])

  const renderVisibleArea = useCallback(() => {
    const canvas = canvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    
    if (!canvas || !offscreenCanvas) return
    
    const width = containerDimensions.width || window.innerWidth
    const height = containerDimensions.height || window.innerHeight - 100
    
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const sourceX = Math.max(0, Math.floor(-viewPosition.x / viewScale))
    const sourceY = Math.max(0, Math.floor(-viewPosition.y / viewScale))
    const canvasWidth = containerDimensions.width || window.innerWidth
    const canvasHeight = containerDimensions.height || window.innerHeight - 100
    
    const sourceWidth = Math.min(
      mapDimensions.width - sourceX, 
      Math.ceil(canvasWidth / viewScale)
    )
    const sourceHeight = Math.min(
      mapDimensions.height - sourceY, 
      Math.ceil(canvasHeight / viewScale)
    )
    
    const destX = Math.max(0, viewPosition.x)
    const destY = Math.max(0, viewPosition.y)
    const destWidth = sourceWidth * viewScale
    const destHeight = sourceHeight * viewScale
    
    if (sourceWidth > 0 && sourceHeight > 0) {
      ctx.drawImage(
        offscreenCanvas,
        sourceX, sourceY, sourceWidth, sourceHeight,
        destX, destY, destWidth, destHeight
      )
    }
    
    if (selectedFeature) {
      const selectedX = (selectedFeature.x * viewScale) + viewPosition.x
      const selectedY = (selectedFeature.y * viewScale) + viewPosition.y
      const selectedSize = 24 * viewScale
      
      if (selectedX >= -selectedSize && selectedY >= -selectedSize && 
          selectedX < canvasWidth && selectedY < canvasHeight) {
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 3
        ctx.setLineDash([6, 3])
        ctx.strokeRect(selectedX - selectedSize/2, selectedY - selectedSize/2, selectedSize, selectedSize)
        
        ctx.strokeStyle = '#daa520'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.strokeRect(selectedX - selectedSize/2 + 1, selectedY - selectedSize/2 + 1, selectedSize - 2, selectedSize - 2)
        
        ctx.shadowColor = 'rgba(218, 165, 32, 0.8)'
        ctx.shadowBlur = 8
        ctx.strokeRect(selectedX - selectedSize/2, selectedY - selectedSize/2, selectedSize, selectedSize)
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }
    }
    
    // Rendu du marqueur du groupe joueur
    if (playerGroup) {
      const playerX = (playerGroup.x * viewScale) + viewPosition.x
      const playerY = (playerGroup.y * viewScale) + viewPosition.y
      const playerSize = 16 * viewScale
      
      if (playerX >= -playerSize && playerY >= -playerSize && 
          playerX < canvasWidth && playerY < canvasHeight) {
        
        // Ombre du marqueur
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        
        // Corps du marqueur - fond
        ctx.fillStyle = '#2c5530'
        ctx.beginPath()
        ctx.arc(playerX, playerY, playerSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Bordure du marqueur
        ctx.strokeStyle = '#4a7c59'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Icône du groupe (épée croisée)
        ctx.fillStyle = '#ffd700'
        ctx.font = `${Math.max(10, playerSize * 0.8)}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('⚔️', playerX, playerY)
        
        // Indicateur de mouvement si le groupe se déplace
        if (playerGroup.isMoving && playerGroup.targetX && playerGroup.targetY) {
          const targetX = (playerGroup.targetX * viewScale) + viewPosition.x
          const targetY = (playerGroup.targetY * viewScale) + viewPosition.y
          
          // Ligne de déplacement
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'
          ctx.lineWidth = 2
          ctx.setLineDash([8, 4])
          ctx.beginPath()
          ctx.moveTo(playerX, playerY)
          ctx.lineTo(targetX, targetY)
          ctx.stroke()
          ctx.setLineDash([])
          
          // Marqueur de destination
          ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
          ctx.beginPath()
          ctx.arc(targetX, targetY, playerSize * 0.6, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.fillStyle = '#2c5530'
          ctx.font = `${Math.max(8, playerSize * 0.5)}px serif`
          ctx.fillText('📍', targetX, targetY)
        }
      }
    }
  }, [viewPosition, viewScale, containerDimensions, mapDimensions, selectedFeature, playerGroup])

  const getFeatureAtPosition = useCallback((clientX, clientY) => {
    if (!canvasRef.current || (!mapData && !mapDataRef.current)) return null
    
    const rect = canvasRef.current.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top
    
    const worldX = (canvasX - viewPosition.x) / viewScale
    const worldY = (canvasY - viewPosition.y) / viewScale
    
    const currentMapData = mapData || mapDataRef.current
    const searchRadius = 20
    
    const allFeatures = [
      ...currentMapData.features.cities.map(f => ({ ...f, type: 'city' })),
      ...currentMapData.features.towns.map(f => ({ ...f, type: 'town' })),
      ...currentMapData.features.villages.map(f => ({ ...f, type: 'village' })),
      ...currentMapData.features.pois.map(f => ({ ...f, type: 'poi' }))
    ]
    
    for (const feature of allFeatures) {
      const distance = Math.sqrt((feature.x - worldX) ** 2 + (feature.y - worldY) ** 2)
      if (distance < searchRadius) {
        return feature
      }
    }
    
    return null
  }, [viewPosition, viewScale, mapData])

  const handleCanvasClick = useCallback((e) => {
    const feature = getFeatureAtPosition(e.clientX, e.clientY)
    if (feature && onFeatureClick) {
      onFeatureClick(feature)
    }
  }, [getFeatureAtPosition, onFeatureClick])

  const handleCanvasMouseMove = useCallback((e) => {
    const feature = getFeatureAtPosition(e.clientX, e.clientY)
    if (feature && onFeatureHover) {
      onFeatureHover(feature, e)
    } else if (onFeatureLeave) {
      onFeatureLeave()
    }
  }, [getFeatureAtPosition, onFeatureHover, onFeatureLeave])

  useEffect(() => {
    mapCacheRef.current = null
    generateFullMap()
  }, [generateFullMap, JSON.stringify(filters), mapData])

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    
    const width = containerDimensions.width || window.innerWidth
    const height = containerDimensions.height || window.innerHeight - 100
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    renderVisibleArea()
  }, [containerDimensions, renderVisibleArea])

  useEffect(() => {
    const currentParams = {
      viewPosition: JSON.stringify(viewPosition),
      viewScale,
      selectedFeature: selectedFeature ? `${selectedFeature.x}-${selectedFeature.y}` : null
    }
    
    const lastParams = lastRenderParamsRef.current
    
    if (currentParams.viewPosition !== lastParams.viewPosition ||
        currentParams.viewScale !== lastParams.viewScale ||
        currentParams.selectedFeature !== lastParams.selectedFeature) {
      
      if (renderRequestRef.current) {
        cancelAnimationFrame(renderRequestRef.current)
      }
      
      renderRequestRef.current = requestAnimationFrame(() => {
        renderVisibleArea()
        lastRenderParamsRef.current = currentParams
      })
    }
  }, [viewPosition, viewScale, selectedFeature, renderVisibleArea])

  useEffect(() => {
    return () => {
      if (renderRequestRef.current) {
        cancelAnimationFrame(renderRequestRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'pointer',
        imageRendering: 'pixelated'
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
    />
  )
})

RealisticMapRenderer.displayName = 'RealisticMapRenderer'

export default RealisticMapRenderer 