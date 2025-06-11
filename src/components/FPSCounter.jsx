import { useState, useEffect, useRef } from 'react'

const FPSCounter = () => {
  const [fps, setFps] = useState(0)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const animationFrameRef = useRef(null)

  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++
      const currentTime = performance.now()
      
      if (currentTime - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }
      
      animationFrameRef.current = requestAnimationFrame(updateFPS)
    }
    
    animationFrameRef.current = requestAnimationFrame(updateFPS)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 1000
    }}>
      FPS: {fps}
    </div>
  )
}

export default FPSCounter 