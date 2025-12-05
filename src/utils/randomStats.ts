// Generate random views above 33k and likes above 5k
// Each product gets consistent random numbers based on its ID

export const generateRandomViews = (productId: string): number => {
  const hash = hashCode(productId);
  const random = seededRandom(hash);
  // Generate between 33000 and 150000
  return Math.floor(33000 + random * 117000);
};

export const generateRandomLikes = (productId: string): number => {
  const hash = hashCode(productId + '_likes');
  const random = seededRandom(hash);
  // Generate between 5000 and 50000
  return Math.floor(5000 + random * 45000);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// Simple hash function for strings
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Seeded random number generator (0-1)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Random emojis for avatars - user specified list
const AVATAR_EMOJIS = [
  '🦢', '🐑', '🌙', '🧂', '❄️', '🤍', '✨', '💎', '⭐', '🌟', '☁️', '💫', '🥛', '⬜', 
  '🪲', '🦂', '🐜', '👻', '🕷️', '🦇', '💀', '🌑', '🍫', '🖤', '⬛',
  '😈', '😏', '😒', '🙄', '😬', '🤐', '😟', '😕', '🤨', '🤔'
];

export const getRandomAvatarEmoji = (seed: string): string => {
  const hash = hashCode(seed || 'default');
  const index = hash % AVATAR_EMOJIS.length;
  return AVATAR_EMOJIS[index];
};
