import { oatsBreads } from './oatsBreads';
import { fruits } from './fruits';
import { nuts } from './nuts';
import { seeds } from './seeds';
import { butters } from './butters';
import { IMAGE_ASSETS } from './imageAssets';

export { oatsBreads } from './oatsBreads';
export { fruits } from './fruits';
export { nuts } from './nuts';
export { seeds } from './seeds';
export { butters } from './butters';

export const ADDONS = {
  "Spreads & Sweeteners": butters,
  "Fresh Fruits": fruits,
  "Premium Nuts": nuts,
  "Healthy Seeds": seeds,
};

export const COMBOS = [
  {
    "id": "c1",
    "name": "High Protein Brown Rice Bowl",
    "base": "Plain Oats (Soaked/Boiled)",
    "addons": [
      "All Mix Nuts",
      "Almonds"
    ],
    "price": 260,
    "image": "/assets/images/brown_rice_bowl.png",
    "tag": "Best Seller",
    "inStock": true
  },
  {
    "id": "c2",
    "name": "High Protein Quinoa Rice Bowl",
    "base": "Plain Oats (Soaked/Boiled)",
    "addons": [
      "Chia Seeds",
      "Almonds"
    ],
    "price": 280,
    "image": "/assets/images/quinoa_rice_bowl.png",
    "tag": "Superfood",
    "inStock": true
  },
  {
    "id": "c3",
    "name": "Lean Life Salad",
    "base": "Fruit Oats",
    "addons": [
      "Apple",
      "Chia Seeds"
    ],
    "price": 220,
    "image": "/assets/images/lean_life_salad.png",
    "tag": "Weight Loss",
    "inStock": true
  },
  {
    "id": "c4",
    "name": "Overnight Oats Bowl",
    "base": "All Mix Oats (Fruits & Nuts)",
    "addons": [
      "Strawberry",
      "Chia Seeds",
      "Honey"
    ],
    "price": 180,
    "image": "/assets/images/overnight_oats_bowl.png",
    "tag": "Morning Favorite",
    "inStock": true
  },
  {
    "id": "c5",
    "name": "Cold Pressed Juice",
    "base": "Fruit Oats",
    "addons": [
      "Apple",
      "Grapes"
    ],
    "price": 140,
    "image": "/assets/images/cold_pressed_juice.png",
    "tag": "Raw & Fresh",
    "inStock": true
  }
];

export const TAG_COLORS = {
  "High Protein": { bg: "bg-[#FFF3E0]", text: "text-[#E65100]", border: "border-[#FFCC80]" },
  "Fiber Rich": { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#A5D6A7]" },
  "Fresh Fruits": { bg: "bg-[#FCE4EC]", text: "text-[#AD1457]", border: "border-[#F48FB1]" },
  "Healthy Fats": { bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFE082]" },
};

export const REVIEWS = [
  { name: "Priya S.", text: "Best breakfast in Hyderabad! The Fruit Oats with almonds and strawberry is my go-to every morning.", rating: 5, location: "Kondapur Hyderabad" },
  { name: "Rahul K.", text: "High Protein Oats with peanut butter changed my gym mornings completely. Highly recommend!", rating: 5, location: "Heritage Rocks" },
  { name: "Ananya M.", text: "So fresh and healthy. Loved the multigrain bread combo. Will definitely order again!", rating: 5, location: " Near Malkam Cheruvu" },
];

export const WHATSAPP_NUMBER = "919876543210";
export const HERO_BG = IMAGE_ASSETS.heroBg;
export const STORY_BG = IMAGE_ASSETS.storyBg;
