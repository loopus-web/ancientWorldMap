import { memo, useRef, useEffect, useCallback, useMemo } from 'react'
import { getBiomeIcon, getBiomeColor, getPOIIcon } from '../utils/mapGenerator'

const CELL_SIZE = 48
const FONT_SIZE = 20

const OptimizedSingleCanvasRenderer = memo(({ 
  worldMap, 
  viewPosition, 
  viewScale, 
  containerDimensions,
  selectedHex,
  onHexHover,
  onHexLeave,
  onHexClick
}) => {
  const canvasRef = useRef(null)
  const offscreenCanvasRef = useRef(null)
  const renderRequestRef = useRef(null)
  const lastRenderParamsRef = useRef({})
  const mapCacheRef = useRef(null)
  
  const mapDimensions = useMemo(() => {
    if (!worldMap || !worldMap[0]) return { width: 0, height: 0 }
    return {
      width: worldMap[0].length * CELL_SIZE,
      height: worldMap.length * CELL_SIZE
    }
  }, [worldMap])

  const getBiomeColorForCanvas = useCallback((biome) => {
    const colors = {
      forest: '#3d5a3d',
      mountain: '#8b7355', 
      water: '#4a6b7c',
      desert: '#d4a574',
      plains: '#b8a082',
      swamp: '#4a4a2f',
      tundra: '#a8a8a0'
    }
    return colors[biome] || '#b8a082'
  }, [])

  const getVintageIcons = useCallback((hex) => {
    const biomeIcons = {
      forest: '🌲',
      mountain: '⛰️', 
      water: '~',
      desert: '∴',
      plains: '≈',
      swamp: '※',
      tundra: '❅'
    }
    
    if (hex.settlement) {
      return hex.settlement.type === 'city' ? '🏛️' : '🏘️'
    } else if (hex.poi) {
      const poiIcons = {
        ruin: '⚱️',
        mine: '⚒️',
        temple: '⛩️',
        tower: '🗼',
        cave: '🕳️'
      }
      return poiIcons[hex.poi.type] || '✦'
    }
    
    return biomeIcons[hex.biome] || '≈'
  }, [])

  const createParchmentTexture = useCallback((ctx, width, height) => {
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
    gradient.addColorStop(0, 'rgba(245, 235, 210, 0.8)')
    gradient.addColorStop(0.7, 'rgba(230, 215, 185, 0.6)')
    gradient.addColorStop(1, 'rgba(210, 190, 150, 0.9)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(139, 115, 85, ${Math.random() * 0.03})`
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 3 + 1,
        Math.random() * 3 + 1
      )
    }
  }, [])

  const generateFullMap = useCallback(() => {
    if (!worldMap || !worldMap[0] || mapCacheRef.current) return

    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = mapDimensions.width
    offscreenCanvas.height = mapDimensions.height
    const ctx = offscreenCanvas.getContext('2d')
    
    ctx.fillStyle = '#f5ebd2'
    ctx.fillRect(0, 0, mapDimensions.width, mapDimensions.height)
    createParchmentTexture(ctx, mapDimensions.width, mapDimensions.height)
    
    ctx.font = `bold ${FONT_SIZE}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let r = 0; r < worldMap.length; r++) {
      for (let q = 0; q < worldMap[r].length; q++) {
        const hex = worldMap[r][q]
        const x = q * CELL_SIZE
        const y = r * CELL_SIZE
        
        const baseColor = getBiomeColorForCanvas(hex.biome)
        
        const gradient = ctx.createRadialGradient(
          x + CELL_SIZE/2, y + CELL_SIZE/2, 0,
          x + CELL_SIZE/2, y + CELL_SIZE/2, CELL_SIZE/2
        )
        gradient.addColorStop(0, baseColor)
        gradient.addColorStop(1, `${baseColor}cc`)
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        
        ctx.strokeStyle = 'rgba(101, 67, 33, 0.3)'
        ctx.lineWidth = 0.8
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        
        ctx.shadowColor = 'rgba(101, 67, 33, 0.4)'
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        
        const icon = getVintageIcons(hex)
        
        ctx.fillStyle = '#654321'
        ctx.fillText(icon, x + CELL_SIZE / 2, y + CELL_SIZE / 2)
        
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
    }
    
    const borderGradient = ctx.createLinearGradient(0, 0, mapDimensions.width, mapDimensions.height)
    borderGradient.addColorStop(0, 'rgba(101, 67, 33, 0.8)')
    borderGradient.addColorStop(1, 'rgba(139, 115, 85, 0.6)')
    
    ctx.strokeStyle = borderGradient
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, mapDimensions.width, mapDimensions.height)
    
    offscreenCanvasRef.current = offscreenCanvas
    mapCacheRef.current = true
  }, [worldMap, mapDimensions, getBiomeColorForCanvas, getVintageIcons, createParchmentTexture])

  const renderVisibleArea = useCallback(() => {
    const canvas = canvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    
    if (!canvas || !offscreenCanvas || !containerDimensions.width || !containerDimensions.height) return
    
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const sourceX = Math.max(0, Math.floor(-viewPosition.x / viewScale))
    const sourceY = Math.max(0, Math.floor(-viewPosition.y / viewScale))
    const sourceWidth = Math.min(
      mapDimensions.width - sourceX, 
      Math.ceil(containerDimensions.width / viewScale)
    )
    const sourceHeight = Math.min(
      mapDimensions.height - sourceY, 
      Math.ceil(containerDimensions.height / viewScale)
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
    
    if (selectedHex) {
      const selectedX = (selectedHex.q * CELL_SIZE * viewScale) + viewPosition.x
      const selectedY = (selectedHex.r * CELL_SIZE * viewScale) + viewPosition.y
      const selectedSize = CELL_SIZE * viewScale
      
      if (selectedX >= -selectedSize && selectedY >= -selectedSize && 
          selectedX < containerDimensions.width && selectedY < containerDimensions.height) {
        ctx.strokeStyle = '#8b4513'
        ctx.lineWidth = 4
        ctx.setLineDash([8, 4])
        ctx.strokeRect(selectedX, selectedY, selectedSize, selectedSize)
        
        ctx.strokeStyle = '#daa520'
        ctx.lineWidth = 2
        ctx.setLineDash([])
        ctx.strokeRect(selectedX + 1, selectedY + 1, selectedSize - 2, selectedSize - 2)
        
        ctx.shadowColor = 'rgba(218, 165, 32, 0.8)'
        ctx.shadowBlur = 8
        ctx.strokeRect(selectedX, selectedY, selectedSize, selectedSize)
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }
    }
  }, [viewPosition, viewScale, containerDimensions, mapDimensions, selectedHex])

  const getHexAtPosition = useCallback((clientX, clientY) => {
    if (!canvasRef.current || !worldMap) return null
    
    const rect = canvasRef.current.getBoundingClientRect()
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top
    
    const worldX = (canvasX - viewPosition.x) / viewScale
    const worldY = (canvasY - viewPosition.y) / viewScale
    
    const q = Math.floor(worldX / CELL_SIZE)
    const r = Math.floor(worldY / CELL_SIZE)
    
    if (q >= 0 && q < worldMap[0]?.length && r >= 0 && r < worldMap.length) {
      return worldMap[r][q]
    }
    
    return null
  }, [worldMap, viewPosition, viewScale])

  const handleCanvasClick = useCallback((e) => {
    const hex = getHexAtPosition(e.clientX, e.clientY)
    if (hex && onHexClick) {
      onHexClick(hex)
    }
  }, [getHexAtPosition, onHexClick])

  const handleCanvasMouseMove = useCallback((e) => {
    const hex = getHexAtPosition(e.clientX, e.clientY)
    if (hex && (hex.poi || hex.settlement) && onHexHover) {
      onHexHover(hex, e)
    } else if (onHexLeave) {
      onHexLeave()
    }
  }, [getHexAtPosition, onHexHover, onHexLeave])

  useEffect(() => {
    generateFullMap()
  }, [generateFullMap])

  useEffect(() => {
    if (!canvasRef.current || !containerDimensions.width || !containerDimensions.height) return
    
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = containerDimensions.width * dpr
    canvas.height = containerDimensions.height * dpr
    canvas.style.width = `${containerDimensions.width}px`
    canvas.style.height = `${containerDimensions.height}px`
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    renderVisibleArea()
  }, [containerDimensions, renderVisibleArea])

  useEffect(() => {
    const currentParams = {
      viewPosition: JSON.stringify(viewPosition),
      viewScale,
      selectedHex: selectedHex ? `${selectedHex.q}-${selectedHex.r}` : null
    }
    
    const lastParams = lastRenderParamsRef.current
    
    if (currentParams.viewPosition !== lastParams.viewPosition ||
        currentParams.viewScale !== lastParams.viewScale ||
        currentParams.selectedHex !== lastParams.selectedHex) {
      
      if (renderRequestRef.current) {
        cancelAnimationFrame(renderRequestRef.current)
      }
      
      renderRequestRef.current = requestAnimationFrame(() => {
        renderVisibleArea()
        lastRenderParamsRef.current = currentParams
      })
    }
  }, [viewPosition, viewScale, selectedHex, renderVisibleArea])

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

OptimizedSingleCanvasRenderer.displayName = 'OptimizedSingleCanvasRenderer'

export default OptimizedSingleCanvasRenderer 