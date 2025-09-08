export const platforms = {
  connected: [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      account: "Bestie's Bakes", 
      color: '#E4405F', 
      types: ['Post', 'Reel', 'Story'],
      icon: '📷'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      account: "Bestie's Bakes", 
      color: '#000000',
      icon: '🎵'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      account: "Bestie's Bakes", 
      color: '#1877F2', 
      types: ['Post', 'Reel', 'Story'],
      icon: '👥'
    },
    { 
      id: 'threads', 
      name: 'Threads', 
      account: "Bestie's Bakes", 
      color: '#000000',
      icon: '🧵'
    }
  ],
  unconnected: [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      color: '#FF0000', 
      types: ['Video', 'Shorts'],
      icon: '📺'
    },
    { 
      id: 'linkedin', 
      name: 'LinkedIn', 
      color: '#0A66C2',
      icon: '💼'
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      color: '#BD081C', 
      types: ['Pin', 'Video Pin', 'Image Pin'],
      icon: '📌'
    },
    { 
      id: 'x', 
      name: 'X', 
      color: '#000000',
      icon: '❌'
    }
  ]
}

export const getAllPlatforms = () => [
  ...platforms.connected,
  ...platforms.unconnected
]

export const getPlatformById = (id) => {
  return getAllPlatforms().find(platform => platform.id === id)
}