export const platforms = {
  connected: [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      account: "Bestie's Bakes", 
      color: '#E4405F', 
      types: ['Post', 'Reel', 'Story'],
      icon: '📷',
      options: [
        {
          id: 'firstComment',
          label: 'First Comment',
          type: 'text',
          placeholder: 'Add a first comment...',
          icon: '💬'
        },
        {
          id: 'usersCollaborators', 
          label: 'Users & Collaborators',
          type: 'users',
          placeholder: 'Tag users and collaborators...',
          icon: '👥'
        }
      ]
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      account: "Bestie's Bakes", 
      color: '#000000',
      icon: '🎵',
      options: [
        {
          id: 'creatorStore',
          label: 'Feature on your Creator Store',
          type: 'toggle',
          icon: '🛍️'
        }
      ]
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
      icon: '📺',
      options: [
        {
          id: 'notifySubscribers',
          label: 'Notify Subscribers',
          type: 'toggle',
          icon: '🔔'
        },
        {
          id: 'visibility',
          label: 'Visibility',
          type: 'dropdown',
          options: ['Public', 'Unlisted', 'Private'],
          defaultValue: 'Public',
          icon: '👁️'
        },
        {
          id: 'song',
          label: 'Song',
          type: 'text',
          placeholder: 'Add background music...',
          icon: '🎵'
        }
      ]
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
      icon: '📌',
      options: [
        {
          id: 'addLink',
          label: 'Add a Link',
          type: 'url',
          placeholder: 'https://example.com',
          icon: '🔗'
        },
        {
          id: 'chooseBoard',
          label: 'Choose a Board',
          type: 'dropdown',
          options: ['Baking Tips', 'Recipes', 'Behind the Scenes', 'Seasonal'],
          placeholder: 'Select a board...',
          icon: '📋'
        }
      ]
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