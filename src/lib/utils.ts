import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper function for category emojis
export function getCategoryEmoji(category : string) {
  const emojiMap: { [key: string]: string } = {
    Beef: "🥩",
    Chicken: "🍗",
    Dessert: "🍰",
    Lamb: "🍖",
    Miscellaneous: "🍴",
    Pasta: "🍝",
    Pork: "🥓",
    Seafood: "🦐",
    Side: "🥗",
    Starter: "🥟",
    Vegan: "🥬",
    Vegetarian: "🥕",
    Breakfast: "🍳",
    Goat: "🐐",
  };
  return emojiMap[category] || "🍽️";
}

// Helper function for country flags
export function getCountryFlag(country : string) {
  const emojiMap: { [key: string]: string } = {
    American: "🗽",
    British: "👑",
    Canadian: "🍁",
    Chinese: "🐉",
    Croatian: "⚽",
    Dutch: "🌷",
    Egyptian: "🐫",
    Filipino: "🌴",
    French: "🥐",
    Greek: "🏛️",
    Indian: "🪷",
    Irish: "☘️",
    Italian: "🍕",
    Jamaican: "🌴",
    Japanese: "🗾",
    Kenyan: "🦒",
    Malaysian: "🌺",
    Mexican: "🌮",
    Moroccan: "🕌",
    Polish: "🦅",
    Portuguese: "🚢",
    Russian: "❄️",
    Spanish: "💃",
    Thai: "🛕",
    Tunisian: "🏜️",
    Turkish: "🧿",
    Ukrainian: "🌻",
    Vietnamese: "🍜",
    Algerian: "🏜️",
    Argentinian: "⚽",
    Australian: "🦘",
    Norwegian: "❄️",
    "Saudi Arabian": "🕋",
    Slovakian: "🏔️",
    Syrian: "🏛️",
    Uruguayan: "⚽",
    Venezuelan: "🌞",
  };

  return emojiMap[country] ?? "🌍";
}
