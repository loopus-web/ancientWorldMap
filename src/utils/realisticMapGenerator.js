class SimplexNoise {
  constructor(seed = Math.random()) {
    this.seed = seed
    this.perm = new Array(512)
    this.gradP = new Array(512)
    
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
    
    for (let i = 0; i < 256; i++) {
      this.perm[i] = this.perm[i + 256] = p[i]
      this.gradP[i] = this.gradP[i + 256] = this.grad3[p[i] % 12]
    }
  }
  
  grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]
  
  dot(g, x, y) {
    return g[0] * x + g[1] * y
  }
  
  noise(xin, yin) {
    let n0, n1, n2
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0)
    const s = (xin + yin) * F2
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0
    const t = (i + j) * G2
    const X0 = i - t
    const Y0 = j - t
    const x0 = xin - X0
    const y0 = yin - Y0
    
    let i1, j1
    if (x0 > y0) { i1 = 1; j1 = 0 }
    else { i1 = 0; j1 = 1 }
    
    const x1 = x0 - i1 + G2
    const y1 = y0 - j1 + G2
    const x2 = x0 - 1.0 + 2.0 * G2
    const y2 = y0 - 1.0 + 2.0 * G2
    
    const ii = i & 255
    const jj = j & 255
    const gi0 = this.gradP[ii + this.perm[jj]]
    const gi1 = this.gradP[ii + i1 + this.perm[jj + j1]]
    const gi2 = this.gradP[ii + 1 + this.perm[jj + 1]]
    
    let t0 = 0.5 - x0 * x0 - y0 * y0
    if (t0 < 0) n0 = 0.0
    else {
      t0 *= t0
      n0 = t0 * t0 * this.dot(gi0, x0, y0)
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1
    if (t1 < 0) n1 = 0.0
    else {
      t1 *= t1
      n1 = t1 * t1 * this.dot(gi1, x1, y1)
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2
    if (t2 < 0) n2 = 0.0
    else {
      t2 *= t2
      n2 = t2 * t2 * this.dot(gi2, x2, y2)
    }
    
    return 70.0 * (n0 + n1 + n2)
  }
}

export class RealisticMapGenerator {
  constructor(width = 2000, height = 1500, seed = Math.random()) {
    this.width = width
    this.height = height
    this.seed = seed
    this.mainSeed = seed
    this.elevationSeed = seed * 1.5
    this.moistureSeed = seed * 2.0
    this.temperatureSeed = seed * 2.5
    this.continentSeed = seed * 3.0
    this.riverSeed = seed * 3.5
    
    this.noise = new SimplexNoise(seed)
    this.elevationNoise = new SimplexNoise(this.elevationSeed)
    this.moistureNoise = new SimplexNoise(this.moistureSeed)
    this.temperatureNoise = new SimplexNoise(this.temperatureSeed)
    
    this.elevationMap = new Float32Array(width * height)
    this.moistureMap = new Float32Array(width * height)
    this.temperatureMap = new Float32Array(width * height)
    this.biomeMap = new Array(width * height)
    this.features = {
      cities: [],
      towns: [],
      villages: [],
      pois: [],
      rivers: [],
      roads: []
    }
    
    console.log(`🎲 New map with seed: ${seed}`)
  }

  generateContinents() {
    const continentLayouts = [
      [
        { x: 0.3, y: 0.4, size: 0.6, strength: 1.0 },
        { x: 0.75, y: 0.25, size: 0.4, strength: 0.8 },
        { x: 0.15, y: 0.8, size: 0.35, strength: 0.7 }
      ],
      [
        { x: 0.2, y: 0.3, size: 0.5, strength: 0.9 },
        { x: 0.7, y: 0.6, size: 0.45, strength: 0.85 },
        { x: 0.85, y: 0.15, size: 0.25, strength: 0.6 },
        { x: 0.1, y: 0.85, size: 0.3, strength: 0.65 }
      ],
      [
        { x: 0.5, y: 0.2, size: 0.7, strength: 1.0 },
        { x: 0.2, y: 0.7, size: 0.3, strength: 0.7 },
        { x: 0.8, y: 0.8, size: 0.2, strength: 0.5 }
      ],
      [
        { x: 0.15, y: 0.15, size: 0.35, strength: 0.8 },
        { x: 0.65, y: 0.3, size: 0.4, strength: 0.85 },
        { x: 0.35, y: 0.75, size: 0.45, strength: 0.9 },
        { x: 0.85, y: 0.7, size: 0.25, strength: 0.6 }
      ]
    ]
    
    const layoutIndex = Math.floor(Math.random() * continentLayouts.length)
    const baseLayout = continentLayouts[layoutIndex]
    
    const continents = baseLayout.map(continent => ({
      x: this.width * (continent.x + (Math.random() - 0.5) * 0.3),
      y: this.height * (continent.y + (Math.random() - 0.5) * 0.3),
      size: continent.size * (0.7 + Math.random() * 0.6),
      strength: continent.strength * (0.6 + Math.random() * 0.4)
    }))
    
    const islandCount = 5 + Math.floor(Math.random() * 25)
    const islands = []
    for (let i = 0; i < islandCount; i++) {
      islands.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 0.03 + Math.random() * 0.15,
        strength: 0.15 + Math.random() * 0.4
      })
    }
    
    return [...continents, ...islands]
  }

  generateElevation() {
    const scale1 = 0.005 + Math.random() * 0.008
    const scale2 = 0.02 + Math.random() * 0.03
    const scale3 = 0.06 + Math.random() * 0.06
    const landmasses = this.generateContinents()
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x
        
        let elevation = 0
        elevation += this.elevationNoise.noise(x * scale1, y * scale1) * 0.4
        elevation += this.elevationNoise.noise(x * scale2, y * scale2) * 0.35
        elevation += this.elevationNoise.noise(x * scale3, y * scale3) * 0.25
        
        elevation = (elevation + 1) / 2
        
        let landmassFactor = 0
        for (const landmass of landmasses) {
          const dist = Math.sqrt(
            Math.pow((x - landmass.x) / (this.width * landmass.size), 2) + 
            Math.pow((y - landmass.y) / (this.height * landmass.size), 2)
          )
          
          const falloff = Math.max(0, 1 - Math.pow(dist, 1.5 + Math.random() * 0.5))
          landmassFactor = Math.max(landmassFactor, falloff * landmass.strength)
        }
        
        const noiseVariation = this.elevationNoise.noise(x * 0.001, y * 0.001) * 0.15
        landmassFactor += noiseVariation
        
        elevation *= Math.max(0, landmassFactor)
        
        this.elevationMap[idx] = Math.max(0, Math.min(1, elevation))
      }
    }
  }

  generateMoisture() {
    const scale1 = 0.012
    const scale2 = 0.06
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x
        
        let moisture = 0
        moisture += this.noise.noise(x * scale1 + 1000, y * scale1 + 1000) * 0.7
        moisture += this.noise.noise(x * scale2 + 1000, y * scale2 + 1000) * 0.3
        
        moisture = (moisture + 1) / 2
        
        const elevation = this.elevationMap[idx]
        if (elevation < 0.1) {
          moisture = 1.0
        } else {
          const distanceToWater = this.getDistanceToWater(x, y)
          moisture += Math.max(0, 0.3 - distanceToWater / 100) * 0.5
        }
        
        this.moistureMap[idx] = Math.max(0, Math.min(1, moisture))
      }
    }
  }

  generateTemperature() {
    const scale = 0.02
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x
        
        const latitudeFactor = Math.abs(y - this.height/2) / (this.height/2)
        let temperature = 1 - latitudeFactor * 0.8
        
        temperature += this.noise.noise(x * scale + 2000, y * scale + 2000) * 0.3
        
        const elevation = this.elevationMap[idx]
        temperature -= elevation * 0.4
        
        this.temperatureMap[idx] = Math.max(0, Math.min(1, temperature))
      }
    }
  }

  getDistanceToWater(x, y) {
    let minDistance = Infinity
    const searchRadius = 50
    
    for (let dy = -searchRadius; dy <= searchRadius; dy += 5) {
      for (let dx = -searchRadius; dx <= searchRadius; dx += 5) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const nidx = ny * this.width + nx
          if (this.elevationMap[nidx] < 0.1) {
            const distance = Math.sqrt(dx * dx + dy * dy)
            minDistance = Math.min(minDistance, distance)
          }
        }
      }
    }
    
    return minDistance === Infinity ? 1000 : minDistance
  }

  generateBiomes() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x
        const elevation = this.elevationMap[idx]
        const moisture = this.moistureMap[idx]
        const temperature = this.temperatureMap[idx]
        
        let biome = 'ocean'
        
        if (elevation < 0.12) {
          biome = 'ocean'
        } else if (elevation < 0.18) {
          biome = 'coast'
        } else if (elevation > 0.7) {
          biome = temperature > 0.3 ? 'mountain' : 'snow_mountain'
        } else if (moisture < 0.2) {
          biome = temperature > 0.6 ? 'desert' : 'tundra'
        } else if (moisture > 0.7) {
          if (temperature > 0.7) {
            biome = 'tropical_forest'
          } else if (temperature > 0.4) {
            biome = 'forest'
          } else {
            biome = 'taiga'
          }
        } else if (temperature < 0.3) {
          biome = 'tundra'
        } else {
          biome = moisture > 0.4 ? 'grassland' : 'savanna'
        }
        
        this.biomeMap[idx] = biome
      }
    }
  }

  generateRivers() {
    const riverSources = []
    const watersheds = this.findWatersheds()
    
    watersheds.forEach((watershed, index) => {
      const sources = this.findRiverSources(watershed, 2 + Math.floor(Math.random() * 6))
      
      sources.forEach((source, sourceIndex) => {
        const river = this.traceAdvancedRiver(source.x, source.y)
        
        if (river.length > 25) {
          this.features.rivers.push(river)
        }
      })
    })
    
    this.generateTributaries()
  }

  findWatersheds() {
    const watersheds = []
    const processed = new Set()
    
    for (let y = 0; y < this.height; y += 100) {
      for (let x = 0; x < this.width; x += 100) {
        const idx = y * this.width + x
        const elevation = this.elevationMap[idx]
        
        if (elevation > 0.4 && elevation < 0.8) {
          const key = `${Math.floor(x/100)},${Math.floor(y/100)}`
          if (!processed.has(key)) {
            watersheds.push({ x, y, radius: 150 + Math.random() * 100 })
            processed.add(key)
          }
        }
      }
    }
    
    return watersheds
  }

  findRiverSources(watershed, count) {
    const sources = []
    
    for (let i = 0; i < count; i++) {
      let bestSource = null
      let maxElevation = 0
      
      for (let attempts = 0; attempts < 200; attempts++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * watershed.radius
        const x = Math.floor(watershed.x + Math.cos(angle) * distance)
        const y = Math.floor(watershed.y + Math.sin(angle) * distance)
        
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          const idx = y * this.width + x
          const elevation = this.elevationMap[idx]
          
          if (elevation > 0.6 && elevation > maxElevation) {
            const tooClose = sources.some(s => 
              Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2) < 50
            )
            
            if (!tooClose) {
              maxElevation = elevation
              bestSource = { x, y }
            }
          }
        }
      }
      
      if (bestSource) {
        sources.push(bestSource)
      }
    }
    
    return sources
  }

  traceAdvancedRiver(startX, startY) {
    const river = [{ x: startX, y: startY, width: 1 }]
    let currentX = startX
    let currentY = startY
    const visited = new Set()
    let momentum = { x: 0, y: 0 }
    let width = 1
    
    while (river.length < 800) {
      const key = `${currentX},${currentY}`
      if (visited.has(key)) break
      visited.add(key)
      
      const currentIdx = currentY * this.width + currentX
      const currentElevation = this.elevationMap[currentIdx]
      
      if (currentElevation < 0.08) break
      
      const directions = this.getWeightedDirections(currentX, currentY, momentum)
      const bestDirection = this.selectRiverDirection(directions, currentElevation)
      
      if (!bestDirection) break
      
      momentum.x = momentum.x * 0.7 + (bestDirection.x - currentX) * 0.3
      momentum.y = momentum.y * 0.7 + (bestDirection.y - currentY) * 0.3
      
      const elevationDrop = currentElevation - this.elevationMap[bestDirection.y * this.width + bestDirection.x]
      width = Math.min(5, width + elevationDrop * 10)
      
      currentX = bestDirection.x
      currentY = bestDirection.y
      
      const meander = this.addMeander(currentX, currentY, momentum, river.length)
      river.push({ 
        x: currentX + meander.x, 
        y: currentY + meander.y, 
        width: Math.max(1, width) 
      })
    }
    
    return this.smoothRiver(river)
  }

  getWeightedDirections(x, y, momentum) {
    const directions = []
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue
        
        const newX = x + dx
        const newY = y + dy
        
        if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
          const newIdx = newY * this.width + newX
          const elevation = this.elevationMap[newIdx]
          const moisture = this.moistureMap[newIdx]
          
          const distance = Math.sqrt(dx * dx + dy * dy)
          const momentumAlignment = (momentum.x * dx + momentum.y * dy) / Math.max(1, distance)
          
          directions.push({
            x: newX,
            y: newY,
            elevation,
            moisture,
            distance,
            momentumAlignment,
            dx,
            dy
          })
        }
      }
    }
    
    return directions
  }

  selectRiverDirection(directions, currentElevation) {
    const validDirections = directions.filter(d => d.elevation < currentElevation)
    
    if (validDirections.length === 0) {
      return directions.find(d => d.elevation <= currentElevation) || null
    }
    
    let bestDirection = null
    let bestScore = -Infinity
    
    for (const direction of validDirections) {
      const elevationDrop = currentElevation - direction.elevation
      const distancePenalty = 1 / direction.distance
      const momentumBonus = direction.momentumAlignment * 0.3
      const moistureBonus = direction.moisture * 0.2
      
      const score = elevationDrop * 2 + distancePenalty + momentumBonus + moistureBonus
      
      if (score > bestScore) {
        bestScore = score
        bestDirection = direction
      }
    }
    
    return bestDirection
  }

  addMeander(x, y, momentum, riverLength) {
    const meanderStrength = Math.min(0.1, riverLength * 0.0005)
    const meanderFreq = 0.03
    
    const perpX = -momentum.y
    const perpY = momentum.x
    const length = Math.sqrt(perpX * perpX + perpY * perpY)
    
    if (length > 0 && riverLength > 50) {
      const normalizedPerpX = perpX / length
      const normalizedPerpY = perpY / length
      
      const meanderOffset = Math.sin(riverLength * meanderFreq) * meanderStrength
      
      return {
        x: normalizedPerpX * meanderOffset,
        y: normalizedPerpY * meanderOffset
      }
    }
    
    return { x: 0, y: 0 }
  }

  smoothRiver(river) {
    if (river.length < 3) return river
    
    const smoothed = [river[0]]
    
    for (let i = 1; i < river.length - 1; i++) {
      const prev = river[i - 1]
      const curr = river[i]
      const next = river[i + 1]
      
      const smoothedX = (prev.x + curr.x * 2 + next.x) / 4
      const smoothedY = (prev.y + curr.y * 2 + next.y) / 4
      
      smoothed.push({
        x: smoothedX,
        y: smoothedY,
        width: curr.width
      })
    }
    
    smoothed.push(river[river.length - 1])
    return smoothed
  }

  generateTributaries() {
    const mainRivers = [...this.features.rivers]
    
    mainRivers.forEach(mainRiver => {
      if (mainRiver.length > 100) {
        const tributaryCount = 2 + Math.floor(mainRiver.length / 150)
        
        for (let i = 0; i < tributaryCount; i++) {
          const connectionPoint = Math.floor(mainRiver.length * (0.3 + Math.random() * 0.4))
          const riverPoint = mainRiver[connectionPoint]
          
          const tributary = this.findTributarySource(riverPoint, mainRiver)
          if (tributary && tributary.length > 15) {
            this.features.rivers.push(tributary)
          }
        }
      }
    })
  }

  findTributarySource(connectionPoint, mainRiver) {
    const searchRadius = 100
    let bestSource = null
    let maxElevation = 0
    
    for (let attempts = 0; attempts < 100; attempts++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * searchRadius
      const x = Math.floor(connectionPoint.x + Math.cos(angle) * distance)
      const y = Math.floor(connectionPoint.y + Math.sin(angle) * distance)
      
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const idx = y * this.width + x
        const elevation = this.elevationMap[idx]
        
        if (elevation > connectionPoint.elevation && elevation > maxElevation) {
          const tooCloseToMain = mainRiver.some(point => 
            Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < 20
          )
          
          if (!tooCloseToMain) {
            maxElevation = elevation
            bestSource = { x, y }
          }
        }
      }
    }
    
    if (bestSource) {
      const tributary = this.traceAdvancedRiver(bestSource.x, bestSource.y)
      
      const endsNearConnection = tributary.some(point =>
        Math.sqrt((point.x - connectionPoint.x) ** 2 + (point.y - connectionPoint.y) ** 2) < 15
      )
      
      if (endsNearConnection) {
        tributary.push(connectionPoint)
        return tributary
      }
    }
    
    return null
  }

  generateSettlements() {
    const cityCount = 8
    const townCount = 25
    const villageCount = 60
    
    for (let i = 0; i < cityCount; i++) {
      const location = this.findSettlementLocation('city')
      if (location) {
        this.features.cities.push({
          ...location,
          name: this.generateCityName(),
          population: 50000 + Math.random() * 100000,
          wealth: Math.random() * 100,
          specialty: this.generateCitySpecialty()
        })
      }
    }
    
    for (let i = 0; i < townCount; i++) {
      const location = this.findSettlementLocation('town')
      if (location) {
        this.features.towns.push({
          ...location,
          name: this.generateTownName(),
          population: 5000 + Math.random() * 20000,
          wealth: Math.random() * 60,
          specialty: this.generateTownSpecialty()
        })
      }
    }
    
    for (let i = 0; i < villageCount; i++) {
      const location = this.findSettlementLocation('village')
      if (location) {
        this.features.villages.push({
          ...location,
          name: this.generateVillageName(),
          population: 100 + Math.random() * 2000,
          wealth: Math.random() * 30,
          specialty: this.generateVillageSpecialty()
        })
      }
    }
  }

  findSettlementLocation(type) {
    for (let attempts = 0; attempts < 1000; attempts++) {
      const x = Math.floor(Math.random() * this.width)
      const y = Math.floor(Math.random() * this.height)
      const idx = y * this.width + x
      
      const elevation = this.elevationMap[idx]
      const moisture = this.moistureMap[idx]
      const biome = this.biomeMap[idx]
      
      if (elevation < 0.15 || elevation > 0.6) continue
      if (biome === 'ocean' || biome === 'desert') continue
      
      const nearWater = this.getDistanceToWater(x, y) < (type === 'city' ? 100 : 200)
      const nearRiver = this.isNearRiver(x, y, 50)
      
      if (type === 'city' && !(nearWater || nearRiver)) continue
      
      const tooCloseToOther = this.isTooCloseToSettlement(x, y, type)
      if (tooCloseToOther) continue
      
      return { x, y, elevation, moisture, biome }
    }
    return null
  }

  isNearRiver(x, y, distance) {
    return this.features.rivers.some(river => 
      river.some(point => 
        Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < distance
      )
    )
  }

  isTooCloseToSettlement(x, y, type) {
    const minDistances = { city: 150, town: 80, village: 40 }
    const minDistance = minDistances[type]
    
    const allSettlements = [
      ...this.features.cities,
      ...this.features.towns,
      ...this.features.villages
    ]
    
    return allSettlements.some(settlement => 
      Math.sqrt((settlement.x - x) ** 2 + (settlement.y - y) ** 2) < minDistance
    )
  }

  generatePOIs() {
    const poiTypes = [
      { type: 'ruin', count: 30, biomes: ['grassland', 'forest', 'desert'] },
      { type: 'mine', count: 20, biomes: ['mountain', 'snow_mountain'] },
      { type: 'temple', count: 15, biomes: ['grassland', 'forest', 'mountain'] },
      { type: 'tower', count: 12, biomes: ['grassland', 'coast'] },
      { type: 'cave', count: 25, biomes: ['mountain', 'forest'] }
    ]
    
    poiTypes.forEach(poiType => {
      for (let i = 0; i < poiType.count; i++) {
        const location = this.findPOILocation(poiType.biomes)
        if (location) {
          this.features.pois.push({
            ...location,
            type: poiType.type,
            name: this.generatePOIName(poiType.type)
          })
        }
      }
    })
  }

  findPOILocation(validBiomes) {
    for (let attempts = 0; attempts < 500; attempts++) {
      const x = Math.floor(Math.random() * this.width)
      const y = Math.floor(Math.random() * this.height)
      const idx = y * this.width + x
      
      const biome = this.biomeMap[idx]
      if (!validBiomes.includes(biome)) continue
      
      const tooCloseToSettlement = this.isTooCloseToSettlement(x, y, 'village')
      if (tooCloseToSettlement) continue
      
      return { x, y, biome }
    }
    return null
  }

  generateCityName() {
    const prefixes = ['Astra', 'Magna', 'Prima', 'Regis', 'Alba', 'Aurea', 'Sancta']
    const suffixes = ['burg', 'haven', 'port', 'ford', 'hall', 'heim', 'garde']
    return prefixes[Math.floor(Math.random() * prefixes.length)] + 
           suffixes[Math.floor(Math.random() * suffixes.length)]
  }

  generateTownName() {
    const names = ['Millbrook', 'Stonehaven', 'Riverside', 'Oakdale', 'Thornfield', 'Goldmeadow', 'Silverbrook', 'Ironwood', 'Redhill', 'Greenvalley']
    return names[Math.floor(Math.random() * names.length)]
  }

  generateVillageName() {
    const names = ['Little Creek', 'Old Mill', 'Crossroads', 'Pebble Beach', 'Misty Hollow', 'Quiet Grove', 'Sunny Fields', 'Rocky Point', 'Pine Rest', 'Meadow View']
    return names[Math.floor(Math.random() * names.length)]
  }

  generatePOIName(type) {
    const names = {
      ruin: ['Ancient Ruins', 'Lost Temple', 'Forgotten Keep', 'Old Tower', 'Crumbling Fortress'],
      mine: ['Iron Mine', 'Gold Quarry', 'Silver Pit', 'Copper Works', 'Stone Quarry'],
      temple: ['Sacred Grove', 'Holy Shrine', 'Divine Temple', 'Sacred Circle', 'Ancient Altar'],
      tower: ['Wizard Tower', 'Watch Tower', 'Signal Beacon', 'Lone Spire', 'Guardian Tower'],
      cave: ['Dark Cave', 'Crystal Cavern', 'Hidden Grotto', 'Deep Hollow', 'Mystery Cave']
    }
    const typeNames = names[type] || ['Mysterious Place']
    return typeNames[Math.floor(Math.random() * typeNames.length)]
  }

  generateCitySpecialty() {
    const specialties = [
      'Maritime Trade', 'Arts & Culture', 'Magic Academy', 'Royal Forge',
      'Diplomatic Center', 'Merchant Port', 'Religious Capital', 'Guild City'
    ]
    return specialties[Math.floor(Math.random() * specialties.length)]
  }

  generateTownSpecialty() {
    const specialties = [
      'Regional Market', 'Craftsmanship', 'Inn-Relay', 'Local Mine',
      'Livestock', 'Agriculture', 'Wood & Carpentry', 'Textile'
    ]
    return specialties[Math.floor(Math.random() * specialties.length)]
  }

  generateVillageSpecialty() {
    const specialties = [
      'Farm', 'Fishing', 'Hunting', 'Herbalism',
      'Miller', 'Blacksmith', 'Inn', 'Shepherd'
    ]
    return specialties[Math.floor(Math.random() * specialties.length)]
  }

  generateTradeRoutes() {
    const allSettlements = [
      ...this.features.cities.map(c => ({ ...c, type: 'city' })),
      ...this.features.towns.map(t => ({ ...t, type: 'town' }))
    ]

    allSettlements.forEach(settlement => {
      const nearbySettlements = allSettlements
        .filter(other => other !== settlement)
        .map(other => ({
          ...other,
          distance: Math.sqrt((other.x - settlement.x) ** 2 + (other.y - settlement.y) ** 2)
        }))
        .filter(other => other.distance < 300)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, settlement.type === 'city' ? 4 : 2)

      nearbySettlements.forEach(target => {
        const routeExists = this.features.roads.some(road =>
          (road.from.x === settlement.x && road.from.y === settlement.y &&
           road.to.x === target.x && road.to.y === target.y) ||
          (road.from.x === target.x && road.from.y === target.y &&
           road.to.x === settlement.x && road.to.y === settlement.y)
        )

        if (!routeExists) {
          const route = this.generateRoute(settlement, target)
          this.features.roads.push({
            from: { x: settlement.x, y: settlement.y, name: settlement.name },
            to: { x: target.x, y: target.y, name: target.name },
            path: route,
            type: settlement.type === 'city' && target.type === 'city' ? 'major' : 'minor'
          })
        }
      })
    })
  }

  generateRoute(start, end) {
    const path = [{ x: start.x, y: start.y }]
    let currentX = start.x
    let currentY = start.y
    const targetX = end.x
    const targetY = end.y

    while (Math.abs(currentX - targetX) > 5 || Math.abs(currentY - targetY) > 5) {
      const dx = targetX - currentX
      const dy = targetY - currentY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance === 0) break

      const stepSize = 8
      const normalizedDx = (dx / distance) * stepSize
      const normalizedDy = (dy / distance) * stepSize

      const noiseOffset = 3
      const noiseX = (Math.random() - 0.5) * noiseOffset
      const noiseY = (Math.random() - 0.5) * noiseOffset

      currentX += normalizedDx + noiseX
      currentY += normalizedDy + noiseY

      currentX = Math.max(0, Math.min(this.width - 1, currentX))
      currentY = Math.max(0, Math.min(this.height - 1, currentY))

      path.push({ x: Math.round(currentX), y: Math.round(currentY) })
    }

    path.push({ x: targetX, y: targetY })
    return path
  }

  generate() {
    console.log('Generating advanced realistic map...')
    this.generateElevation()
    this.generateMoisture()
    this.generateTemperature()
    this.generateBiomes()
    this.generateRivers()
    this.generateSettlements()
    this.generatePOIs()
    this.generateTradeRoutes()
    console.log('Realistic map generated with trade routes!')
    
    return {
      width: this.width,
      height: this.height,
      elevationMap: this.elevationMap,
      moistureMap: this.moistureMap,
      temperatureMap: this.temperatureMap,
      biomeMap: this.biomeMap,
      features: this.features
    }
  }
}

export const getBiomeColor = (biome) => {
  const colors = {
    ocean: '#2c5f7c',
    coast: '#4a8fa8',
    mountain: '#8b7355',
    snow_mountain: '#d4d4d4',
    desert: '#d4a574',
    forest: '#3d5a3d',
    tropical_forest: '#2d4a2d',
    taiga: '#4a5a4a',
    grassland: '#8fa05a',
    savanna: '#b8a082',
    tundra: '#a8a8a0'
  }
  return colors[biome] || '#8fa05a'
} 