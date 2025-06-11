import { memo, useState } from 'react'

const MapLegend = memo(({ visible, onToggle, filters, onFilterChange }) => {
  const [activeTab, setActiveTab] = useState('biomes')

  const legendData = {
    biomes: [
      { icon: '🌊', name: 'Ocean', color: '#2c5f7c', description: 'Mysterious deep waters' },
      { icon: '🏖️', name: 'Coast', color: '#4a8fa8', description: 'Welcoming shores' },
      { icon: '⛰️', name: 'Mountains', color: '#8b7355', description: 'Majestic peaks' },
      { icon: '🏔️', name: 'Snowy Peaks', color: '#d4d4d4', description: 'Eternally white summits' },
      { icon: '🏜️', name: 'Desert', color: '#d4a574', description: 'Burning sands' },
      { icon: '🌲', name: 'Forest', color: '#3d5a3d', description: 'Enchanted woods' },
      { icon: '🌴', name: 'Jungle', color: '#2d4a2d', description: 'Dense tropical forests' },
      { icon: '🌿', name: 'Grasslands', color: '#8fa05a', description: 'Verdant plains' },
      { icon: '❄️', name: 'Tundra', color: '#a8a8a0', description: 'Frozen northern lands' }
    ],
    settlements: [
      { icon: '🏛️', name: 'City', description: 'Powerful kingdom metropolis' },
      { icon: '🏘️', name: 'Town', description: 'Prosperous merchant town' },
      { icon: '🏠', name: 'Village', description: 'Humble rural hamlet' }
    ],
    features: [
      { icon: '⚱️', name: 'Ruins', description: 'Remnants of ancient empires' },
      { icon: '⚒️', name: 'Mine', description: 'Mining extraction well' },
      { icon: '⛩️', name: 'Temple', description: 'Sacred sanctuary' },
      { icon: '🗼', name: 'Tower', description: 'Watchtower or arcane tower' },
      { icon: '🕳️', name: 'Cave', description: 'Deep natural cavern' }
    ],
    routes: [
      { icon: '━', name: 'Major Road', color: '#8b7355', description: 'Main royal road' },
      { icon: '┅', name: 'Minor Road', color: '#8b7355', description: 'Country path' },
      { icon: '〰️', name: 'River', color: '#4a6b7c', description: 'Winding waterway' }
    ]
  }

  const filterLabels = {
    settlements: '🏛️ Settlements',
    pois: '⚱️ Points of Interest',
    routes: '━ Roads',
    rivers: '〰️ Waterways'
  }

  if (!visible) {
    return (
      <button 
        className="control-button"
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 100,
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.02em'
        }}
      >
        📜 Ancient Legend
      </button>
    )
  }

  return (
    <div className="legend-panel">
      <div 
        className="legend-header"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(139, 105, 20, 0.4) 100%)',
          padding: '1rem 1.2rem',
          borderBottom: '2px solid var(--accent-bronze)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <span style={{
          fontWeight: '700',
          fontSize: '1rem',
          color: 'var(--ink-brown)',
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          letterSpacing: '0.03em',
          textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span className="ornament" style={{ fontSize: '1.2rem' }}>❦</span>
          Kingdom Legend
          <span className="ornament" style={{ fontSize: '1.2rem' }}>❦</span>
        </span>
        <button 
          onClick={onToggle}
          style={{
            background: 'linear-gradient(135deg, var(--accent-bronze), var(--accent-copper))',
            border: '2px solid var(--accent-gold)',
            color: 'var(--paper-cream)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '0.3rem',
            borderRadius: '0.3rem',
            transition: 'all 0.3s ease',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Cinzel', serif",
            fontWeight: '600',
            textShadow: '1px 1px 2px rgba(74, 44, 23, 0.5)',
            boxShadow: '0 2px 6px rgba(26, 18, 6, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, var(--accent-gold), var(--accent-bronze))'
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 4px 12px rgba(26, 18, 6, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, var(--accent-bronze), var(--accent-copper))'
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 2px 6px rgba(26, 18, 6, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          ✕
        </button>
      </div>

      <div 
        className="legend-tabs"
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--accent-bronze)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {Object.keys(legendData).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '0.7rem 0.4rem',
              border: 'none',
              background: activeTab === tab ? 
                'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(139, 105, 20, 0.4))' : 
                'transparent',
              color: activeTab === tab ? 'var(--ink-brown)' : 'var(--text-dark)',
              fontWeight: activeTab === tab ? '700' : '600',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease',
              borderBottom: activeTab === tab ? '3px solid var(--accent-gold)' : '3px solid transparent',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em',
              textShadow: activeTab === tab ? '1px 1px 2px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          >
            {tab === 'biomes' && '🌍 '}
            {tab === 'settlements' && '🏛️ '}
            {tab === 'features' && '⚱️ '}
            {tab === 'routes' && '━ '}
            {tab}
          </button>
        ))}
      </div>

      <div 
        className="legend-content scroll-container"
        style={{
          padding: '1rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {legendData[activeTab].map((item, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.7rem',
              padding: '0.7rem',
              borderRadius: '0.5rem',
              background: 'rgba(249, 245, 231, 0.6)',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 6px rgba(26, 18, 6, 0.2), inset 0 1px 0 rgba(249, 245, 231, 0.8)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(212, 175, 55, 0.2)'
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.4)'
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 4px 12px rgba(26, 18, 6, 0.3), inset 0 1px 0 rgba(249, 245, 231, 0.9)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(249, 245, 231, 0.6)'
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.2)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 6px rgba(26, 18, 6, 0.2), inset 0 1px 0 rgba(249, 245, 231, 0.8)'
            }}
          >
            <div style={{
              fontSize: '1.1rem',
              marginRight: '0.7rem',
              width: '1.5rem',
              textAlign: 'center',
              filter: 'drop-shadow(1px 1px 2px rgba(74, 44, 23, 0.3))'
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '600',
                color: 'var(--ink-brown)',
                fontSize: '0.85rem',
                marginBottom: '0.2rem',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.02em',
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.2)'
              }}>
                {item.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-dark)',
                lineHeight: '1.3',
                fontFamily: "'Cinzel', serif",
                fontStyle: 'italic',
                letterSpacing: '0.01em'
              }}>
                {item.description}
              </div>
            </div>
            {item.color && (
              <div style={{
                width: '1rem',
                height: '1rem',
                backgroundColor: item.color,
                borderRadius: '0.3rem',
                border: '2px solid rgba(212, 175, 55, 0.4)',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(26, 18, 6, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }} />
            )}
          </div>
        ))}
      </div>

      <div 
        className="legend-filters"
        style={{
          padding: '1rem',
          borderTop: '2px solid var(--accent-bronze)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(139, 105, 20, 0.25))',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{
          fontWeight: '700',
          marginBottom: '0.7rem',
          color: 'var(--ink-brown)',
          fontSize: '0.85rem',
          fontFamily: "'Cinzel', serif",
          letterSpacing: '0.02em',
          textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <span style={{ filter: 'drop-shadow(1px 1px 2px rgba(74, 44, 23, 0.3))' }}>🎛️</span>
          Display Filters
        </div>
        
        {['settlements', 'pois', 'routes', 'rivers'].map(filterType => (
          <label
            key={filterType}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.4rem',
              transition: 'all 0.3s ease',
              fontFamily: "'Cinzel', serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(249, 245, 231, 0.3)'
              e.target.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.transform = 'translateX(0)'
            }}
          >
            <input
              type="checkbox"
              checked={filters[filterType]}
              onChange={(e) => onFilterChange(filterType, e.target.checked)}
              style={{
                marginRight: '0.7rem',
                width: '1rem',
                height: '1rem',
                accentColor: 'var(--accent-gold)',
                cursor: 'pointer',
                border: '2px solid var(--accent-bronze)',
                borderRadius: '0.3rem'
              }}
            />
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--ink-brown)',
              fontWeight: '600',
              letterSpacing: '0.02em',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.2)'
            }}>
              {filterLabels[filterType]}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
})

MapLegend.displayName = 'MapLegend'
export default MapLegend 