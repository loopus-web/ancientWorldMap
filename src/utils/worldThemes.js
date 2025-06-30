export const worldThemes = {
  medieval: {
    id: 'medieval',
    name: 'Medieval',
    icon: '⚔️',
    description: 'A world of knights, castles, and ancient kingdoms',
    cityPrefixes: ['Castle', 'Fort', 'Keep', 'Citadel'],
    citySuffixes: ['burg', 'shire', 'haven', 'gate', 'ford', 'bridge', 'wick'],
    townPrefixes: ['Market', 'Mill', 'Fair'],
    townSuffixes: ['ton', 'ham', 'worth', 'field', 'stead'],
    villagePrefixes: ['Little', 'Old', 'New', 'Upper', 'Lower'],
    villageSuffixes: ['thorpe', 'wick', 'by', 'croft', 'leigh'],
    poiTypes: {
      ancient_castle: { icon: '🏰', name: 'Ancient Castle' },
      monastery: { icon: '⛪', name: 'Monastery' },
      battlefield: { icon: '⚔️', name: 'Battlefield' },
      shrine: { icon: '🕯️', name: 'Shrine' },
      watchtower: { icon: '🗼', name: 'Watchtower' }
    },
    specialties: {
      city: ['Royal Court', 'Grand Cathedral', 'Knights Academy', 'Merchant Guild', 'Blacksmith Quarter'],
      town: ['Market Square', 'Artisan Quarter', 'Breweries', 'Textile Mills', 'Horse Markets'],
      village: ['Farming', 'Shepherding', 'Woodcutting', 'Quarrying', 'Fishing']
    },
    events: {
      political: ['Royal Coronation', 'Noble Uprising', 'Treaty Signing', 'Border Dispute'],
      economic: ['Trade Fair', 'Harvest Festival', 'Market Crisis', 'New Trade Route'],
      military: ['Barbarian Raid', 'Knight Tournament', 'Siege', 'Crusade'],
      cultural: ['Religious Pilgrimage', 'Troubadour Festival', 'Royal Wedding', 'Heresy Trial']
    }
  },
  
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🧙',
    description: 'A magical world of wizards, dragons, and enchanted realms',
    cityPrefixes: ['Crystal', 'Dragon', 'Arcane', 'Mystic', 'Elder'],
    citySuffixes: ['spire', 'hold', 'reach', 'fell', 'moor', 'garde'],
    townPrefixes: ['Moon', 'Star', 'Shadow', 'Silver'],
    townSuffixes: ['vale', 'wood', 'hollow', 'glen', 'brook'],
    villagePrefixes: ['Fairy', 'Gnome', 'Halfling', 'Elven'],
    villageSuffixes: ['dell', 'grove', 'meadow', 'glade', 'spring'],
    poiTypes: {
      wizard_tower: { icon: '🏛️', name: 'Wizard Tower' },
      dragon_lair: { icon: '🐉', name: 'Dragon Lair' },
      enchanted_forest: { icon: '🌲', name: 'Enchanted Forest' },
      ancient_ruins: { icon: '🗿', name: 'Ancient Ruins' },
      magic_portal: { icon: '🌀', name: 'Magic Portal' }
    },
    specialties: {
      city: ['Mage Academy', 'Enchantment Forges', 'Alchemist Quarter', 'Dragon Riders', 'Crystal Mines'],
      town: ['Potion Breweries', 'Spell Components', 'Magical Beasts', 'Rune Crafting', 'Divination'],
      village: ['Herb Gathering', 'Fairy Circles', 'Magical Farming', 'Crystal Harvesting', 'Spirit Tending']
    },
    events: {
      magical: ['Dragon Awakening', 'Magical Storm', 'Portal Opening', 'Ley Line Surge'],
      political: ['Wizard Council', 'Prophecy Fulfilled', 'Dark Lord Rising', 'Alliance of Races'],
      cultural: ['Magical Tournament', 'Harvest Moon Festival', 'Spirit Night', 'Elemental Convergence'],
      crisis: ['Undead Invasion', 'Demon Incursion', 'Curse Spreading', 'Magic Plague']
    }
  },
  
  scifi: {
    id: 'scifi',
    name: 'Science Fiction',
    icon: '🚀',
    description: 'A futuristic world of advanced technology and space exploration',
    cityPrefixes: ['Neo', 'Cyber', 'Quantum', 'Nova', 'Meta'],
    citySuffixes: ['plex', 'city', 'prime', 'hub', 'core', 'nexus'],
    townPrefixes: ['Tech', 'Data', 'Grid', 'Neural'],
    townSuffixes: ['port', 'node', 'link', 'zone', 'sector'],
    villagePrefixes: ['Agri', 'Bio', 'Eco', 'Solar'],
    villageSuffixes: ['dome', 'lab', 'pod', 'unit', 'cell'],
    poiTypes: {
      research_facility: { icon: '🔬', name: 'Research Facility' },
      crashed_ship: { icon: '🛸', name: 'Crashed Ship' },
      energy_plant: { icon: '⚡', name: 'Energy Plant' },
      ai_core: { icon: '🤖', name: 'AI Core' },
      terraforming_site: { icon: '🌍', name: 'Terraforming Site' }
    },
    specialties: {
      city: ['Spaceport', 'AI Research', 'Quantum Computing', 'Biotech Labs', 'Energy Harvesting'],
      town: ['Tech Manufacturing', 'Data Mining', 'Robotics', 'Neural Interfaces', 'Clone Facilities'],
      village: ['Hydroponic Farms', 'Solar Arrays', 'Mining Outpost', 'Research Station', 'Monitoring Post']
    },
    events: {
      technological: ['AI Awakening', 'New Discovery', 'System Malfunction', 'Quantum Breakthrough'],
      political: ['Corporate Takeover', 'Colony Independence', 'Trade War', 'Diplomatic Summit'],
      crisis: ['Alien Contact', 'Solar Flare', 'Nano Plague', 'Resource Shortage'],
      cultural: ['Virtual Festival', 'Augmentation Rights', 'Digital Art Expo', 'Memory Upload Day']
    }
  },
  
  steampunk: {
    id: 'steampunk',
    name: 'Steampunk',
    icon: '⚙️',
    description: 'A world of steam-powered machinery and Victorian innovation',
    cityPrefixes: ['Brass', 'Steam', 'Gear', 'Clock', 'Iron'],
    citySuffixes: ['works', 'forge', 'haven', 'borough', 'junction'],
    townPrefixes: ['Copper', 'Coal', 'Engine', 'Boiler'],
    townSuffixes: ['mill', 'depot', 'yard', 'station', 'works'],
    villagePrefixes: ['Cog', 'Pipe', 'Valve', 'Spring'],
    villageSuffixes: ['hamlet', 'hollow', 'bend', 'ridge', 'crossing'],
    poiTypes: {
      airship_dock: { icon: '🎈', name: 'Airship Dock' },
      clocktower: { icon: '🕐', name: 'Grand Clocktower' },
      steam_factory: { icon: '🏭', name: 'Steam Factory' },
      inventor_workshop: { icon: '🔧', name: 'Inventor Workshop' },
      underground_railway: { icon: '🚂', name: 'Underground Railway' }
    },
    specialties: {
      city: ['Airship Port', 'Clockwork Academy', 'Steam Engine Works', 'Inventor Guild', 'Coal Exchange'],
      town: ['Gear Manufacturing', 'Brass Foundry', 'Automaton Workshop', 'Boiler Works', 'Telegraph Station'],
      village: ['Coal Mining', 'Copper Smithing', 'Pipe Fitting', 'Steam Farming', 'Cog Crafting']
    },
    events: {
      technological: ['New Invention', 'Boiler Explosion', 'Automaton Uprising', 'Airship Race'],
      industrial: ['Factory Strike', 'Coal Shortage', 'Trade Exhibition', 'Railway Opening'],
      cultural: ['Inventor Fair', 'Steam Rally', 'Clockwork Opera', 'Gear Festival'],
      adventure: ['Sky Pirates', 'Underground Discovery', 'Time Machine Test', 'Steam Dragon Sighting']
    }
  }
}

export const getRandomName = (theme, type) => {
  const themeData = worldThemes[theme]
  if (!themeData) return 'Unknown'
  
  let prefixes, suffixes
  
  switch(type) {
    case 'city':
      prefixes = themeData.cityPrefixes
      suffixes = themeData.citySuffixes
      break
    case 'town':
      prefixes = themeData.townPrefixes
      suffixes = themeData.townSuffixes
      break
    case 'village':
      prefixes = themeData.villagePrefixes
      suffixes = themeData.villageSuffixes
      break
    default:
      return 'Settlement'
  }
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  
  return `${prefix}${suffix}`
}

export const getRandomSpecialty = (theme, type) => {
  const themeData = worldThemes[theme]
  if (!themeData || !themeData.specialties[type]) return 'General'
  
  const specialties = themeData.specialties[type]
  return specialties[Math.floor(Math.random() * specialties.length)]
}

export const getRandomPOI = (theme) => {
  const themeData = worldThemes[theme]
  if (!themeData) return { type: 'ruins', name: 'Unknown Ruins' }
  
  const poiTypes = Object.keys(themeData.poiTypes)
  const poiType = poiTypes[Math.floor(Math.random() * poiTypes.length)]
  
  return {
    type: poiType,
    ...themeData.poiTypes[poiType]
  }
}

export const getRandomEvent = (theme) => {
  const themeData = worldThemes[theme]
  if (!themeData) return null
  
  const eventCategories = Object.keys(themeData.events)
  const category = eventCategories[Math.floor(Math.random() * eventCategories.length)]
  const events = themeData.events[category]
  const event = events[Math.floor(Math.random() * events.length)]
  
  return {
    category,
    name: event,
    theme
  }
}