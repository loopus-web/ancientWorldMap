import { memo, useRef, useEffect, useCallback, useMemo } from 'react'
import { getBiomeIcon, getBiomeColor, getPOIIcon } from '../utils/mapGenerator'

const CELL_SIZE = 48
const FONT_SIZE = 20
const TILE_SIZE = 512

const TiledCanvasMapRenderer = memo(({ 
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
  const tilesCache = useRef(new Map())
  const renderRequestRef = useRef(null)
  const lastRenderParamsRef = useRef({})
  
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

  const createTile = useCallback((tileX, tileY) => {
    const tileCanvas = document.createElement('canvas')
    tileCanvas.width = TILE_SIZE
    tileCanvas.height = TILE_SIZE
    const ctx = tileCanvas.getContext('2d')
    
    ctx.font = `${FONT_SIZE}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    ctx.fillStyle = getBiomeColorForCanvas('plains')
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE)
    
    const startCellX = Math.floor((tileX * TILE_SIZE) / CELL_SIZE)
    const startCellY = Math.floor((tileY * TILE_SIZE) / CELL_SIZE)
    const endCellX = Math.min(worldMap[0]?.length || 0, startCellX + Math.ceil(TILE_SIZE / CELL_SIZE) + 1)
    const endCellY = Math.min(worldMap.length, startCellY + Math.ceil(TILE_SIZE / CELL_SIZE) + 1)
    
    for (let r = startCellY; r < endCellY; r++) {
      for (let q = startCellX; q < endCellX; q++) {
        const hex = worldMap[r]?.[q]
        if (!hex) continue
        
        const x = (q * CELL_SIZE) - (tileX * TILE_SIZE)
        const y = (r * CELL_SIZE) - (tileY * TILE_SIZE)
        
        ctx.fillStyle = getBiomeColorForCanvas(hex.biome)
        ctx.fillRect(x - 1, y - 1, CELL_SIZE + 2, CELL_SIZE + 2)
        
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
    
    return tileCanvas
  }, [worldMap, getBiomeColorForCanvas])

  const getTile = useCallback((tileX, tileY) => {
    const tileKey = `${tileX}-${tileY}`
    
    if (!tilesCache.current.has(tileKey)) {
      tilesCache.current.set(tileKey, createTile(tileX, tileY))
    }
    
    return tilesCache.current.get(tileKey)
  }, [createTile])

  const renderVisibleArea = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerDimensions.width || !containerDimensions.height) return
    
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const startTileX = Math.floor(Math.max(0, -viewPosition.x) / TILE_SIZE) - 1
    const startTileY = Math.floor(Math.max(0, -viewPosition.y) / TILE_SIZE) - 1
    const endTileX = Math.ceil(Math.max(0, -viewPosition.x + containerDimensions.width / viewScale) / TILE_SIZE) + 1
    const endTileY = Math.ceil(Math.max(0, -viewPosition.y + containerDimensions.height / viewScale) / TILE_SIZE) + 1
    
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        if (tileX < 0 || tileY < 0) continue
        
        const tile = getTile(tileX, tileY)
        
        const destX = Math.floor((tileX * TILE_SIZE * viewScale) + viewPosition.x)
        const destY = Math.floor((tileY * TILE_SIZE * viewScale) + viewPosition.y)
        const destWidth = Math.ceil(TILE_SIZE * viewScale) + 1
        const destHeight = Math.ceil(TILE_SIZE * viewScale) + 1
        
        ctx.drawImage(
          tile,
          destX,
          destY,
          destWidth,
          destHeight
        )
      }
    }
    
    if (selectedHex) {
      const selectedX = (selectedHex.q * CELL_SIZE * viewScale) + viewPosition.x
      const selectedY = (selectedHex.r * CELL_SIZE * viewScale) + viewPosition.y
      const selectedSize = CELL_SIZE * viewScale
      
      if (selectedX >= -selectedSize && selectedY >= -selectedSize && 
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
  }, [viewPosition, viewScale, containerDimensions, selectedHex, getTile])

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
    tilesCache.current.clear()
  }, [worldMap])

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

TiledCanvasMapRenderer.displayName = 'TiledCanvasMapRenderer'

export default TiledCanvasMapRenderer 