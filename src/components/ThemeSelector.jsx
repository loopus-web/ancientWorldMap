import { memo } from 'react'
import { worldThemes } from '../utils/worldThemes'

const ThemeSelector = memo(({ currentTheme, onThemeChange, visible, onClose }) => {
  if (!visible) return null

  return (
    <div className="theme-selector-overlay" onClick={onClose}>
      <div className="theme-selector" onClick={(e) => e.stopPropagation()}>
        <div className="theme-selector-header">
          <h2>Choose Your World Theme</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="theme-selector-content">
          {Object.values(worldThemes).map((theme) => (
            <div
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'selected' : ''}`}
              onClick={() => {
                onThemeChange(theme.id)
                onClose()
              }}
            >
              <div className="theme-icon">{theme.icon}</div>
              <div className="theme-info">
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
              </div>
              {currentTheme === theme.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        <style>{`
          .theme-selector-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(5px);
          }

          .theme-selector {
            background: var(--glass-bg);
            backdrop-filter: var(--blur-backdrop);
            -webkit-backdrop-filter: var(--blur-backdrop);
            border: 2px solid var(--glass-border);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 16px 64px rgba(0, 0, 0, 0.3);
          }

          .theme-selector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .theme-selector-header h2 {
            margin: 0;
            font-family: 'Cinzel Decorative', serif;
            color: var(--text-light);
            font-size: 1.5rem;
          }

          .close-button {
            background: transparent;
            border: 1px solid var(--glass-border);
            color: var(--text-light);
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s ease;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
          }

          .theme-selector-content {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .theme-option {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--glass-border);
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
          }

          .theme-option:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--accent-gold);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
          }

          .theme-option.selected {
            background: linear-gradient(135deg, 
              rgba(212, 175, 55, 0.15), 
              rgba(139, 105, 20, 0.1)
            );
            border-color: var(--accent-gold);
          }

          .theme-icon {
            font-size: 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 4rem;
            height: 4rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
          }

          .theme-info {
            flex: 1;
          }

          .theme-info h3 {
            margin: 0 0 0.5rem 0;
            font-family: 'Cinzel', serif;
            color: var(--text-light);
            font-size: 1.2rem;
          }

          .theme-info p {
            margin: 0;
            color: var(--text-medium);
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .selected-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 2rem;
            height: 2rem;
            background: var(--accent-gold);
            color: var(--paper-cream);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    </div>
  )
})

ThemeSelector.displayName = 'ThemeSelector'
export default ThemeSelector