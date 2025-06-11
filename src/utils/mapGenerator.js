class NoiseGenerator {
  constructor(seed = Math.random()) {
    this.seed = seed
  }
  
  hash(x, y) {
    let h = this.seed + x * 374761393 + y * 668265263
    h = (h ^ (h >>> 13)) * 1274126177
    return (h ^ (h >>> 16)) / 4294967296
  }
  
  noise(x, y) {
    const intX = Math.floor(x)
    const intY = Math.floor(y)
    const fracX = x - intX
    const fracY = y - intY
    
    const a = this.hash(intX, intY)
    const b = this.hash(intX + 1, intY)
    const c = this.hash(intX, intY + 1)
    const d = this.hash(intX + 1, intY + 1)
    
    const i1 = this.interpolate(a, b, fracX)
    const i2 = this.interpolate(c, d, fracX)
    return this.interpolate(i1, i2, fracY)
  }
  
  interpolate(a, b, t) {
    const ft = t * Math.PI
    const f = (1 - Math.cos(ft)) * 0.5
    return a * (1 - f) + b * f
  }
  
  octaveNoise(x, y, octaves = 4, persistence = 0.5) {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= 2
    }
    
    return total / maxValue
  }
}

const BIOMES = [
  'forest', 'mountain', 'water', 'desert', 'plains', 'swamp', 'tundra'
]

const SETTLEMENT_NAMES = [
  'Alderheart', 'Ironhold', 'Goldenvale', 'Shadowmere', 'Thornwick',
  'Ravenshollow', 'Silverbrook', 'Dragonspire', 'Moonhaven', 'Stormwind',
  'Blackwater', 'Redstone', 'Whitehall', 'Greenvale', 'Darkwood',
  'Brightwater', 'Frosthold', 'Sundale', 'Mistral', 'Emberfall',
  'Crystalbrook', 'Ironwood', 'Goldleaf', 'Silverpine', 'Rosehaven',
  'Thornbridge', 'Willowbrook', 'Oakheart', 'Stoneguard', 'Riverdale'
]

const POI_NAMES = {
  dungeon: [
    'Shadow Cave', 'Forgotten Dungeon', 'Ancient Crypt', 'Cursed Labyrinth',
    'Mysterious Ruins', 'Abandoned Temple', 'Dragon Cave', 'Dark Catacombs'
  ],
  temple: [
    'Temple of Light', 'Ancient Sanctuary', 'Sacred Monastery', 'Golden Cathedral',
    'Altar of the Gods', 'Eternal Basilica', 'Mystic Chapel', 'Blessed Shrine'
  ],
  ruin: [
    'Elven Ruins', 'Destroyed Citadel', 'Ruined Tower', 'Abandoned Castle',
    'Forgotten Fortress', 'Decrepit Palace', 'Broken Ramparts', 'Collapsed Dungeon'
  ],
  tower: [
    'Mage Tower', 'Watchtower', 'Mystic Lighthouse', 'Tower of Winds',
    'Ancient Observatory', 'Crystal Tower', 'Haunted Belfry', 'Ivory Tower'
  ]
}

export const getBiomeIcon = (biome) => {
  const icons = {
    forest: '🌲',
    mountain: '⛰️',
    water: '🌊',
    desert: '🏜️',
    plains: '🌾',
    swamp: '🌿',
    tundra: '❄️'
  }
  return icons[biome] || '🌾'
}

export const getPOIIcon = (type) => {
  const icons = {
    dungeon: '🕳️',
    temple: '⛪',
    ruin: '🏛️',
    tower: '🗼'
  }
  return icons[type] || '📍'
}

export const getBiomeColor = (biome) => {
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
}

const generateBiome = (elevation, moisture, temperature) => {
  if (elevation < 0.2) return 'water'
  if (elevation > 0.8) return 'mountain'
  if (elevation > 0.7 && temperature < 0.3) return 'tundra'
  
  if (moisture < 0.3) {
    return temperature > 0.6 ? 'desert' : 'tundra'
  } else if (moisture < 0.6) {
    return 'plains'
  } else if (moisture < 0.8) {
    return temperature > 0.4 ? 'forest' : 'tundra'
  } else {
    return elevation < 0.4 ? 'swamp' : 'forest'
  }
}

const isValidSettlementLocation = (biome, elevation) => {
  const validBiomes = ['plains', 'forest']
  return validBiomes.includes(biome) && elevation > 0.25 && elevation < 0.7
}

const getRandomName = (nameArray) => {
  return nameArray[Math.floor(Math.random() * nameArray.length)]
}

const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export const generateWorldMap = (width, height) => {
  const noise = new NoiseGenerator(Math.random())
  const map = []
  const settlements = []
  
  for (let r = 0; r < height; r++) {
    map[r] = []
    for (let q = 0; q < width; q++) {
      const x = q / width
      const y = r / height
      
      const elevation = noise.octaveNoise(x * 4, y * 4, 4, 0.5)
      const moisture = noise.octaveNoise(x * 3 + 100, y * 3 + 100, 3, 0.6)
      const temperature = noise.octaveNoise(x * 2 + 200, y * 2 + 200, 2, 0.7)
      
      const biome = generateBiome(elevation, moisture, temperature)
      
      map[r][q] = {
        q,
        r,
        biome,
        elevation,
        moisture,
        temperature,
        settlement: null,
        poi: null
      }
    }
  }
  
  const minDistanceBetweenSettlements = 8
  const maxSettlements = Math.floor((width * height) / 400)
  
  for (let attempts = 0; attempts < maxSettlements * 10 && settlements.length < maxSettlements; attempts++) {
    const q = Math.floor(Math.random() * width)
    const r = Math.floor(Math.random() * height)
    const hex = map[r][q]
    
    if (!isValidSettlementLocation(hex.biome, hex.elevation)) continue
    
    const tooClose = settlements.some(settlement => 
      getDistance(q, r, settlement.q, settlement.r) < minDistanceBetweenSettlements
    )
    
    if (tooClose) continue
    
    const isMajorCity = settlements.length < 5 && Math.random() < 0.3
    const settlement = {
      q,
      r,
      name: getRandomName(SETTLEMENT_NAMES),
      type: isMajorCity ? 'city' : 'village',
      population: isMajorCity ? Math.floor(Math.random() * 5000) + 2000 : Math.floor(Math.random() * 500) + 100
    }
    
    hex.settlement = settlement
    settlements.push(settlement)
  }
  
  const poiDensity = 0.02
  const totalPOIs = Math.floor(width * height * poiDensity)
  const poiTypes = ['dungeon', 'temple', 'ruin', 'tower']
  
  for (let attempts = 0; attempts < totalPOIs * 10; attempts++) {
    const q = Math.floor(Math.random() * width)
    const r = Math.floor(Math.random() * height)
    const hex = map[r][q]
    
    if (hex.settlement || hex.poi || hex.biome === 'water') continue
    
    const nearSettlement = settlements.some(settlement => 
      getDistance(q, r, settlement.q, settlement.r) < 3
    )
    
    if (nearSettlement) continue
    
    const poiType = poiTypes[Math.floor(Math.random() * poiTypes.length)]
    
    hex.poi = {
      type: poiType,
      name: getRandomName(POI_NAMES[poiType]),
      danger: Math.floor(Math.random() * 5) + 1
    }
  }
  
  return map
} 