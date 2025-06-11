import { memo, useState, useCallback } from 'react'

const MapSaveLoad = memo(({ mapData, onLoadMap, visible, onToggle }) => {
  const [savedMaps, setSavedMaps] = useState(() => {
    const saved = localStorage.getItem('savedMaps')
    return saved ? JSON.parse(saved) : []
  })
  const [mapName, setMapName] = useState('')

  const saveMap = useCallback(() => {
    if (!mapData || !mapName.trim()) return

    const mapToSave = {
      id: Date.now(),
      name: mapName.trim(),
      timestamp: new Date().toISOString(),
      data: {
        width: mapData.width,
        height: mapData.height,
        features: mapData.features,
        seed: Math.random()
      }
    }

    const newSavedMaps = [...savedMaps, mapToSave]
    setSavedMaps(newSavedMaps)
    localStorage.setItem('savedMaps', JSON.stringify(newSavedMaps))
    setMapName('')
    
    console.log('Map saved:', mapToSave.name)
  }, [mapData, mapName, savedMaps])

  const loadMap = useCallback((savedMap) => {
    if (onLoadMap) {
      onLoadMap(savedMap.data)
      console.log('Map loaded:', savedMap.name)
    }
  }, [onLoadMap])

  const deleteMap = useCallback((mapId) => {
    const newSavedMaps = savedMaps.filter(map => map.id !== mapId)
    setSavedMaps(newSavedMaps)
    localStorage.setItem('savedMaps', JSON.stringify(newSavedMaps))
  }, [savedMaps])

  if (!visible) {
    return (
      <button 
        className="save-load-toggle"
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '80px',
          right: '10px',
          background: 'linear-gradient(135deg, var(--parchment), var(--parchment-dark))',
          border: '2px solid var(--accent-brown)',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'var(--text-dark)',
          boxShadow: '0 4px 8px var(--vintage-shadow)',
          zIndex: 1000
        }}
      >
        💾 Saved Maps
      </button>
    )
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: '80px',
        right: '10px',
        width: '300px',
        maxHeight: '500px',
        background: 'linear-gradient(135deg, var(--parchment), var(--parchment-dark))',
        border: '3px solid var(--accent-brown)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px var(--vintage-shadow)',
        zIndex: 1000
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-brown), var(--accent-gold))',
        color: 'var(--parchment)',
        padding: '12px 16px',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>💾 Saved Maps</span>
        <button 
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--parchment)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: 'var(--text-dark)'
          }}>
            💾 Save current map
          </div>
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Map name..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid var(--accent-brown)',
              borderRadius: '6px',
              background: 'var(--parchment)',
              color: 'var(--text-dark)',
              fontSize: '14px',
              marginBottom: '8px'
            }}
          />
          <button
            onClick={saveMap}
            disabled={!mapData || !mapName.trim()}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: mapData && mapName.trim() 
                ? 'linear-gradient(135deg, var(--accent-brown), var(--accent-gold))' 
                : '#ccc',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--parchment)',
              fontWeight: 'bold',
              cursor: mapData && mapName.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            💾 Save
          </button>
        </div>

        <div>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '12px',
            color: 'var(--text-dark)'
          }}>
            📂 Saved Maps ({savedMaps.length})
          </div>
          
          <div style={{
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            {savedMaps.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-dark)',
                opacity: 0.7,
                fontStyle: 'italic',
                padding: '20px'
              }}>
                No saved maps
              </div>
            ) : (
              savedMaps.map(savedMap => (
                <div 
                  key={savedMap.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid var(--accent-brown)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{
                    fontWeight: 'bold',
                    color: 'var(--text-dark)',
                    marginBottom: '4px'
                  }}>
                    {savedMap.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-dark)',
                    opacity: 0.8,
                    marginBottom: '8px'
                  }}>
                    {new Date(savedMap.timestamp).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => loadMap(savedMap)}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, var(--accent-brown), var(--accent-gold))',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'var(--parchment)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      📂 Load
                    </button>
                    <button
                      onClick={() => deleteMap(savedMap.id)}
                      style={{
                        padding: '6px 8px',
                        background: '#dc3545',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

MapSaveLoad.displayName = 'MapSaveLoad'

export default MapSaveLoad 