import { memo } from 'react'

const FeaturePanel = memo(({ feature, onClose }) => {
  if (!feature) return null

  const getFeatureIcon = (feature) => {
    if (feature.type === 'city') return '🏛️'
    if (feature.type === 'town') return '🏘️'
    if (feature.type === 'village') return '🏠'
    if (feature.type === 'poi') {
      const icons = {
        ruin: '⚱️',
        mine: '⚒️',
        temple: '⛩️',
        tower: '🗼',
        cave: '🕳️'
      }
      return icons[feature.type] || '✦'
    }
    return '📍'
  }

  const getWealthLevel = (wealth) => {
    if (wealth >= 80) return { level: 'Very Rich', icon: '💰💰💰', color: 'var(--accent-gold)' }
    if (wealth >= 60) return { level: 'Rich', icon: '💰💰', color: 'var(--accent-bronze)' }
    if (wealth >= 40) return { level: 'Prosperous', icon: '💰', color: 'var(--accent-copper)' }
    if (wealth >= 20) return { level: 'Modest', icon: '🪙', color: 'var(--text-medium)' }
    return { level: 'Poor', icon: '🪙', color: 'var(--text-dark)' }
  }

  const getPopulationSize = (population) => {
    if (population >= 100000) return 'Metropolis'
    if (population >= 50000) return 'Large City'
    if (population >= 20000) return 'City'
    if (population >= 10000) return 'Large Town'
    if (population >= 5000) return 'Town'
    if (population >= 1000) return 'Borough'
    return 'Village'
  }

  const wealth = feature.wealth ? getWealthLevel(feature.wealth) : null

  return (
    <div className="feature-panel">
      <div className="feature-panel-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          fontWeight: '700',
          color: 'var(--ink-brown)',
          gap: '0.6rem',
          fontFamily: "'Cinzel Decorative', 'Cinzel', serif",
          letterSpacing: '0.03em',
          textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)'
        }}>
          <span style={{ 
            fontSize: '1.2rem',
            filter: 'drop-shadow(1px 1px 2px rgba(74, 44, 23, 0.3))'
          }}>
            {getFeatureIcon(feature)}
          </span>
          <span className="ornament" style={{ fontSize: '1.2rem' }}>❦</span>
          {feature.name}
          <span className="ornament" style={{ fontSize: '1.2rem' }}>❦</span>
        </div>
        <button
          onClick={onClose}
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

      <div className="feature-panel-content scroll-container">
        {feature.population && (
          <div className="feature-stat">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                fontWeight: '600', 
                color: 'var(--ink-brown)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.02em'
              }}>
                👥 Population
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--accent-gold)',
                fontWeight: '600',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(139, 105, 20, 0.3))',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.3rem',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                fontFamily: "'Cinzel', serif",
                textShadow: '1px 1px 2px rgba(255, 255, 255, 0.2)'
              }}>
                {getPopulationSize(feature.population)}
              </span>
            </div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'var(--ink-brown)',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              {Math.floor(feature.population).toLocaleString()} inhabitants
            </div>
          </div>
        )}

        {wealth && (
          <div className="feature-stat">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{ 
                fontWeight: '600', 
                color: 'var(--ink-brown)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.02em'
              }}>
                💼 Wealth
              </span>
              <span style={{ 
                fontSize: '1rem',
                filter: 'drop-shadow(1px 1px 2px rgba(74, 44, 23, 0.3))'
              }}>
                {wealth.icon}
              </span>
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: wealth.color,
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.2)'
            }}>
              {wealth.level}
            </div>
          </div>
        )}

        {feature.specialty && (
          <div className="feature-stat">
            <div style={{
              fontWeight: '600',
              color: 'var(--ink-brown)',
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              ⚡ Specialty
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'var(--accent-gold)',
              fontWeight: '600',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.2)'
            }}>
              {feature.specialty}
            </div>
          </div>
        )}

        {feature.biome && (
          <div className="feature-stat">
            <div style={{
              fontWeight: '600',
              color: 'var(--ink-brown)',
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              🌍 Environment
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'var(--text-dark)',
              fontWeight: '600',
              textTransform: 'capitalize',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              {feature.biome.replace('_', ' ')}
            </div>
          </div>
        )}

        {feature.type === 'poi' && (
          <div className="feature-stat">
            <div style={{
              fontWeight: '600',
              color: 'var(--ink-brown)',
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              🗺️ Type
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'var(--accent-bronze)',
              fontWeight: '600',
              textTransform: 'capitalize',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.02em'
            }}>
              {feature.type}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '0.6rem',
          padding: '0.8rem',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(139, 105, 20, 0.18))',
          border: '2px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-dark)',
          lineHeight: '1.4',
          fontFamily: "'Cinzel', serif",
          fontWeight: '500',
          letterSpacing: '0.02em',
          textShadow: '1px 1px 2px rgba(255, 255, 255, 0.3)',
          position: 'relative'
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            marginRight: '0.4rem',
            filter: 'drop-shadow(1px 1px 2px rgba(74, 44, 23, 0.3))'
          }}>
            📍
          </span>
          Coordinates: {Math.round(feature.x)}, {Math.round(feature.y)}
        </div>
      </div>
    </div>
  )
})

FeaturePanel.displayName = 'FeaturePanel'
export default FeaturePanel 