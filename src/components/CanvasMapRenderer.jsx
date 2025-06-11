import { memo, useRef, useEffect, useCallback, useMemo } from 'react'
import { getBiomeIcon, getBiomeColor, getPOIIcon } from '../utils/mapGenerator'

const CELL_SIZE = 48
const FONT_SIZE = 20

const CanvasMapRenderer = memo(({ 
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
  const lastRenderParamsRef = useRef({})
  const mapCacheRef = useRef(null)
  const renderRequestRef = useRef(null)
  
  const mapDimensions = useMemo(() => {
    if (!worldMap || !worldMap[0]) return { width: 0, height: 0 }
    return {
      width: worldMap[0].length * CELL_SIZE,
      height: worldMap.length * CELL_SIZE
    }
  }, [worldMap])

  const getBiomeColorForCanvas = useCallback((biome) => {
    const colors = {
      forest: '#228b22',
      mountain: '#696969', 
      water: '#4169e1',
      desert: '#f4a460',
      plains: '#9acd32',
      swamp: '#556b2f',
      tundra: '#b0c4de'
    }
    return colors[biome] || '#9acd32'
  }, [])

  const renderOffscreenMap = useCallback(() => {
    if (!worldMap || !worldMap[0]) return

    if (offscreenCanvasRef.current && mapCacheRef.current) {
      return
    }

    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = mapDimensions.width
    offscreenCanvas.height = mapDimensions.height
    const ctx = offscreenCanvas.getContext('2d')
    
    ctx.font = `${FONT_SIZE}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    for (let r = 0; r < worldMap.length; r++) {
      for (let q = 0; q < worldMap[r].length; q++) {
        const hex = worldMap[r][q]
        const x = q * CELL_SIZE
        const y = r * CELL_SIZE
        
        ctx.fillStyle = getBiomeColorForCanvas(hex.biome)
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
        
        let icon = getBiomeIcon(hex.biome)
        if (hex.settlement) {
          icon = hex.settlement.type === 'city' ? '🏰' : '🏘️'
        } else if (hex.poi) {
          icon = getPOIIcon(hex.poi.type)
        }
        
        ctx.fillStyle = '#ffffff'
        ctx.fillText(icon, x + CELL_SIZE / 2, y + CELL_SIZE / 2)
      }
    }
    
    offscreenCanvasRef.current = offscreenCanvas
    mapCacheRef.current = true
  }, [worldMap, mapDimensions, getBiomeColorForCanvas])

  const renderVisibleArea = useCallback(() => {
    const canvas = canvasRef.current
    const offscreenCanvas = offscreenCanvasRef.current
    
    if (!canvas || !offscreenCanvas || !containerDimensions.width || !containerDimensions.height) return
    
    const ctx = canvas.getContext('2d')
    
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const sourceX = Math.max(0, -viewPosition.x / viewScale)
    const sourceY = Math.max(0, -viewPosition.y / viewScale)
    const sourceWidth = Math.min(mapDimensions.width - sourceX, containerDimensions.width / viewScale)
    const sourceHeight = Math.min(mapDimensions.height - sourceY, containerDimensions.height / viewScale)
    
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
      const selectedX = (selectedHex.q * CELL_SIZE - sourceX) * viewScale + destX
      const selectedY = (selectedHex.r * CELL_SIZE - sourceY) * viewScale + destY
      const selectedSize = CELL_SIZE * viewScale
      
      if (selectedX >= 0 && selectedY >= 0 && 
          selectedX < containerDimensions.width && selectedY < containerDimensions.height) {
        ctx.strokeStyle = '#d4af37'
        ctx.lineWidth = 3
        ctx.strokeRect(selectedX, selectedY, selectedSize, selectedSize)
        
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)'
        ctx.shadowBlur = 10
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
    renderOffscreenMap()
  }, [renderOffscreenMap])

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

CanvasMapRenderer.displayName = 'CanvasMapRenderer'

export default CanvasMapRenderer 