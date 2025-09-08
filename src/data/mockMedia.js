// Mock media data with reliable placeholder images for testing
export const mockMediaItems = [
  {
    id: 1,
    type: 'image',
    name: 'Chocolate Cupcake',
    url: 'https://picsum.photos/seed/cupcake1/500/500',
    thumbnail: 'https://picsum.photos/seed/cupcake1/150/150'
  },
  {
    id: 2,
    type: 'image',
    name: 'Rainbow Cake',
    url: 'https://picsum.photos/seed/cake1/500/500',
    thumbnail: 'https://picsum.photos/seed/cake1/150/150'
  },
  {
    id: 3,
    type: 'image',
    name: 'Strawberry Tart',
    url: 'https://picsum.photos/seed/tart1/500/500',
    thumbnail: 'https://picsum.photos/seed/tart1/150/150'
  },
  {
    id: 4,
    type: 'image',
    name: 'Macaron Tower',
    url: 'https://picsum.photos/seed/macaron1/500/500',
    thumbnail: 'https://picsum.photos/seed/macaron1/150/150'
  },
  {
    id: 5,
    type: 'image',
    name: 'Wedding Cake',
    url: 'https://picsum.photos/seed/wedding1/500/500',
    thumbnail: 'https://picsum.photos/seed/wedding1/150/150'
  },
  {
    id: 6,
    type: 'image',
    name: 'Donut Selection',
    url: 'https://picsum.photos/seed/donut1/500/500',
    thumbnail: 'https://picsum.photos/seed/donut1/150/150'
  },
  {
    id: 7,
    type: 'image',
    name: 'Fresh Croissants',
    url: 'https://picsum.photos/seed/croissant1/500/500',
    thumbnail: 'https://picsum.photos/seed/croissant1/150/150'
  },
  {
    id: 8,
    type: 'image',
    name: 'Bakery Display',
    url: 'https://picsum.photos/seed/bakery1/500/500',
    thumbnail: 'https://picsum.photos/seed/bakery1/150/150'
  },
  {
    id: 9,
    type: 'image',
    name: 'Birthday Cake',
    url: 'https://picsum.photos/seed/birthday1/500/500',
    thumbnail: 'https://picsum.photos/seed/birthday1/150/150'
  },
  {
    id: 10,
    type: 'image',
    name: 'Artisan Bread',
    url: 'https://picsum.photos/seed/bread1/500/500',
    thumbnail: 'https://picsum.photos/seed/bread1/150/150'
  },
  {
    id: 11,
    type: 'image',
    name: 'Cookie Platter',
    url: 'https://picsum.photos/seed/cookie1/500/500',
    thumbnail: 'https://picsum.photos/seed/cookie1/150/150'
  },
  {
    id: 12,
    type: 'image',
    name: 'Lemon Tart',
    url: 'https://picsum.photos/seed/lemon1/500/500',
    thumbnail: 'https://picsum.photos/seed/lemon1/150/150'
  },
  {
    id: 13,
    type: 'image',
    name: 'Bakery Interior',
    url: 'https://picsum.photos/seed/interior1/500/500',
    thumbnail: 'https://picsum.photos/seed/interior1/150/150'
  },
  {
    id: 14,
    type: 'image',
    name: 'Vanilla Cupcakes',
    url: 'https://picsum.photos/seed/vanilla1/500/500',
    thumbnail: 'https://picsum.photos/seed/vanilla1/150/150'
  },
  {
    id: 15,
    type: 'image',
    name: 'Pastry Display',
    url: 'https://picsum.photos/seed/pastry1/500/500',
    thumbnail: 'https://picsum.photos/seed/pastry1/150/150'
  },
  {
    id: 16,
    type: 'image',
    name: 'Chocolate Brownies',
    url: 'https://picsum.photos/seed/brownie1/500/500',
    thumbnail: 'https://picsum.photos/seed/brownie1/150/150'
  },
  {
    id: 17,
    type: 'image',
    name: 'French Macarons',
    url: 'https://picsum.photos/seed/french1/500/500',
    thumbnail: 'https://picsum.photos/seed/french1/150/150'
  },
  {
    id: 18,
    type: 'image',
    name: 'Tiramisu Cake',
    url: 'https://picsum.photos/seed/tiramisu1/500/500',
    thumbnail: 'https://picsum.photos/seed/tiramisu1/150/150'
  },
  {
    id: 19,
    type: 'image',
    name: 'Fresh Baguettes',
    url: 'https://picsum.photos/seed/baguette1/500/500',
    thumbnail: 'https://picsum.photos/seed/baguette1/150/150'
  },
  {
    id: 20,
    type: 'image',
    name: 'Dessert Spread',
    url: 'https://picsum.photos/seed/dessert1/500/500',
    thumbnail: 'https://picsum.photos/seed/dessert1/150/150'
  }
]

// Helper function to get random media items
export const getRandomMediaItems = (count = 1) => {
  const shuffled = [...mockMediaItems].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Helper function to get media item by id
export const getMediaItemById = (id) => {
  return mockMediaItems.find(item => item.id === id)
}