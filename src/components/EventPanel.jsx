import { memo } from 'react'
import { worldThemes } from '../utils/worldThemes'

const EventPanel = memo(({ events, theme, visible, onClose }) => {
  if (!visible) return null

  const themeData = worldThemes[theme] || worldThemes.medieval

  return (
    <div className="event-panel">
      <div className="event-panel-header">
        <h3>
          <span className="theme-icon">{themeData.icon}</span>
          World Events
        </h3>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>
      
      <div className="event-panel-content">
        {events.length === 0 ? (
          <div className="no-events">
            <p>No recent events to display</p>
            <p className="event-hint">Events will occur as time passes...</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event, index) => (
              <div key={event.id} className="event-item">
                <div className="event-header">
                  <span className="event-category">{event.category}</span>
                  <span className="event-time">
                    {Math.floor((Date.now() - event.timestamp) / 1000)}s ago
                  </span>
                </div>
                <h4 className="event-name">{event.name}</h4>
                {event.effects && (
                  <div className="event-effects">
                    {event.effects.map((effect, idx) => (
                      <div key={idx} className="effect-item">
                        <span className="effect-icon">→</span>
                        <span className="effect-desc">{effect.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .event-panel {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 320px;
          max-height: 600px;
          background: var(--glass-bg);
          backdrop-filter: var(--blur-backdrop);
          -webkit-backdrop-filter: var(--blur-backdrop);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .event-panel-header {
          padding: 1rem;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1), 
            rgba(255, 255, 255, 0.05)
          );
        }

        .event-panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Cinzel', serif;
        }

        .theme-icon {
          font-size: 1.2rem;
        }

        .close-button {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-light);
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .event-panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .no-events {
          text-align: center;
          color: var(--text-medium);
          padding: 2rem;
        }

        .event-hint {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .event-item:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(-2px);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .event-category {
          font-size: 0.8rem;
          text-transform: uppercase;
          color: var(--accent-gold);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .event-time {
          font-size: 0.8rem;
          color: var(--text-medium);
        }

        .event-name {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          color: var(--text-light);
          font-family: 'Cinzel', serif;
        }

        .event-effects {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.5rem;
        }

        .effect-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-medium);
        }

        .effect-icon {
          color: var(--accent-bronze);
        }
      `}</style>
    </div>
  )
})

EventPanel.displayName = 'EventPanel'
export default EventPanel