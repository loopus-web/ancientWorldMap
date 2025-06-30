import { getRandomEvent } from './worldThemes'

export class EventSystem {
  constructor(theme) {
    this.theme = theme
    this.events = []
    this.currentTime = 0
    this.eventInterval = 10000 // 10 secondes entre les événements
    this.lastEventTime = 0
    this.tradeRoutes = new Map()
    this.activeEvents = []
  }

  update(deltaTime) {
    this.currentTime += deltaTime
    
    // Vérifier si un nouvel événement doit se déclencher
    if (this.currentTime - this.lastEventTime > this.eventInterval) {
      this.triggerRandomEvent()
      this.lastEventTime = this.currentTime
    }
    
    // Mettre à jour les événements actifs
    this.activeEvents = this.activeEvents.filter(event => {
      event.duration -= deltaTime
      return event.duration > 0
    })
  }

  triggerRandomEvent() {
    const eventData = getRandomEvent(this.theme)
    if (!eventData) return
    
    const event = {
      id: Date.now(),
      ...eventData,
      timestamp: this.currentTime,
      duration: 30000, // 30 secondes par défaut
      effects: this.generateEventEffects(eventData)
    }
    
    this.events.push(event)
    this.activeEvents.push(event)
    
    // Appliquer les effets de l'événement
    this.applyEventEffects(event)
    
    return event
  }

  generateEventEffects(eventData) {
    const effects = []
    
    switch(eventData.category) {
      case 'economic':
      case 'trade':
        effects.push({
          type: 'trade_route',
          chance: 0.6,
          description: 'New trade routes may open'
        })
        effects.push({
          type: 'wealth_boost',
          amount: 10 + Math.random() * 20,
          description: 'Settlements gain wealth'
        })
        break
        
      case 'political':
        effects.push({
          type: 'alliance',
          chance: 0.4,
          description: 'Cities may form alliances'
        })
        effects.push({
          type: 'influence_change',
          amount: -10 + Math.random() * 20,
          description: 'Political influence shifts'
        })
        break
        
      case 'military':
      case 'crisis':
        effects.push({
          type: 'population_loss',
          amount: 5 + Math.random() * 15,
          description: 'Population decreases'
        })
        effects.push({
          type: 'trade_disruption',
          chance: 0.7,
          description: 'Trade routes may be disrupted'
        })
        break
        
      case 'cultural':
      case 'magical':
      case 'technological':
        effects.push({
          type: 'knowledge_gain',
          amount: 5 + Math.random() * 10,
          description: 'Knowledge and culture spread'
        })
        effects.push({
          type: 'attraction_boost',
          amount: 10 + Math.random() * 20,
          description: 'Settlements become more attractive'
        })
        break
    }
    
    return effects
  }

  applyEventEffects(event) {
    event.effects.forEach(effect => {
      switch(effect.type) {
        case 'trade_route':
          if (Math.random() < effect.chance) {
            this.createNewTradeRoute()
          }
          break
          
        case 'trade_disruption':
          if (Math.random() < effect.chance) {
            this.disruptTradeRoute()
          }
          break
      }
    })
  }

  createNewTradeRoute() {
    // Cette méthode sera appelée depuis le générateur de carte
    // pour créer une nouvelle route commerciale
    const routeId = `route_${Date.now()}`
    const route = {
      id: routeId,
      createdAt: this.currentTime,
      active: true
    }
    
    this.tradeRoutes.set(routeId, route)
    return route
  }

  disruptTradeRoute() {
    const routes = Array.from(this.tradeRoutes.values()).filter(r => r.active)
    if (routes.length > 0) {
      const route = routes[Math.floor(Math.random() * routes.length)]
      route.active = false
      route.disruptedAt = this.currentTime
    }
  }

  getActiveTradeRoutes() {
    return Array.from(this.tradeRoutes.values()).filter(r => r.active)
  }

  getRecentEvents(count = 5) {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count)
  }

  getActiveEvents() {
    return this.activeEvents
  }

  triggerSpecificEvent(category, name) {
    const event = {
      id: Date.now(),
      category,
      name,
      theme: this.theme,
      timestamp: this.currentTime,
      duration: 30000,
      effects: this.generateEventEffects({ category })
    }
    
    this.events.push(event)
    this.activeEvents.push(event)
    this.applyEventEffects(event)
    
    return event
  }
}