import InstagramIcon from '../components/icons/InstagramIcon'
import FacebookIcon from '../components/icons/FacebookIcon'
import PinterestIcon from '../components/icons/PinterestIcon'
import ThreadsIcon from '../components/icons/ThreadsIcon'
import TikTokIcon from '../components/icons/TikTokIcon'
import TwitterIcon from '../components/icons/TwitterIcon'
import YouTubeIcon from '../components/icons/YouTubeIcon'
import LinkedInIcon from '../components/icons/LinkedInIcon'

export const platforms = {
  connected: [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      account: "Bestie's Bakes", 
      color: '#E4405F', 
      types: ['Post', 'Reel', 'Story'],
      icon: InstagramIcon,
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
      icon: TikTokIcon,
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
      icon: FacebookIcon
    },
    { 
      id: 'threads', 
      name: 'Threads', 
      account: "Bestie's Bakes", 
      color: '#000000',
      icon: ThreadsIcon
    }
  ],
  unconnected: [
    { 
      id: 'youtube', 
      name: 'YouTube', 
      color: '#FF0000', 
      types: ['Video', 'Shorts'],
      icon: YouTubeIcon,
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
      icon: LinkedInIcon
    },
    { 
      id: 'pinterest', 
      name: 'Pinterest', 
      color: '#BD081C', 
      types: ['Pin', 'Video Pin', 'Image Pin'],
      icon: PinterestIcon,
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
      icon: TwitterIcon
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