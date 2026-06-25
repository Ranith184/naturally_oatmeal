import { IMAGE_ASSETS } from './imageAssets';

export const oatsBreads = [
  // 1. High Protein Brown Rice Bowls
  { 
    id: "b10", 
    name: "High Protein Grilled Chicken Brown Rice Bowl", 
    price: 260, 
    tags: ["High Protein"], 
    category: "High Protein Brown Rice Bowls",
    desc: "Steamed organic brown rice loaded with premium lean grilled chicken breast, roasted broccoli, edamame, and zero-sugar homemade dressings.",
    image: IMAGE_ASSETS.brownRiceBowl,
    nutrition: { calories: "450 kcal", protein: "35g", carbs: "52g", fiber: "6g", fat: "8g" },
    benefit: "Excellent for muscle recovery and maintaining lean mass."
  },
  { 
    id: "b11", 
    name: "High Protein Paneer Brown Rice Bowl", 
    price: 250, 
    tags: ["High Protein"], 
    category: "High Protein Brown Rice Bowls",
    desc: "Wholesome organic brown rice served with high-protein grilled paneer cubes, roasted seasonal veggies, and signature sugar-free dressing.",
    image: IMAGE_ASSETS.brownRiceBowl,
    nutrition: { calories: "480 kcal", protein: "22g", carbs: "54g", fiber: "6g", fat: "14g" },
    benefit: "Slow-digesting protein fuels energy throughout the afternoon."
  },
  // 2. High Protein Quinoa Rice Bowls
  { 
    id: "b12", 
    name: "High Protein Grilled Chicken Quinoa Bowl", 
    price: 280, 
    tags: ["High Protein"], 
    category: "High Protein Quinoa Rice Bowls",
    desc: "Nutrient-dense organic quinoa served with grilled chicken breast, sliced avocado, edamame, and light herb vinaigrette.",
    image: IMAGE_ASSETS.quinoaRiceBowl,
    nutrition: { calories: "420 kcal", protein: "38g", carbs: "44g", fiber: "8g", fat: "9g" },
    benefit: "Complete amino acid profile boosts metabolism and muscle repair."
  },
  { 
    id: "b13", 
    name: "High Protein Tofu Quinoa Bowl", 
    price: 270, 
    tags: ["High Protein"], 
    category: "High Protein Quinoa Rice Bowls",
    desc: "Organic quinoa bowl topped with high protein grilled tofu, shredded carrots, spinach leaves, and fresh citrus dressing.",
    image: IMAGE_ASSETS.quinoaRiceBowl,
    nutrition: { calories: "390 kcal", protein: "20g", carbs: "46g", fiber: "8g", fat: "10g" },
    benefit: "100% plant-based protein rich in iron and heart-healthy fats."
  },
  // 3. Lean Life Salads
  { 
    id: "b14", 
    name: "Lean Life Green Salad", 
    price: 220, 
    tags: ["Fiber Rich"], 
    category: "Lean Life Salads",
    desc: "Crisp organic baby spinach, arugula, cherry tomatoes, sliced cucumbers, and avocado, sprinkled with walnuts and chia seeds.",
    image: IMAGE_ASSETS.leanLifeSalad,
    nutrition: { calories: "180 kcal", protein: "6g", carbs: "12g", fiber: "7g", fat: "12g" },
    benefit: "Antioxidant-rich greens support cellular health and weight management."
  },
  { 
    id: "b15", 
    name: "Weight Loss Avocado Salad", 
    price: 240, 
    tags: ["Healthy Fats"], 
    category: "Lean Life Salads",
    desc: "Fresh avocado chunks, mixed organic greens, sunflower seeds, and citrus segments, tossed in extra virgin olive oil. 100% clean nutrition.",
    image: IMAGE_ASSETS.leanLifeSalad,
    nutrition: { calories: "240 kcal", protein: "8g", carbs: "16g", fiber: "9g", fat: "18g" },
    benefit: "Healthy monounsaturated fats keep sugar cravings at bay."
  },
  // 4. Overnight Oats Bowls
  { 
    id: "b1", 
    name: "All Mix Oats (Fruits & Nuts)", 
    price: 120, 
    tags: ["Fiber Rich", "Fresh Fruits"], 
    category: "Overnight Oats Bowls",
    desc: "A wholesome mix of organic oats slow-soaked overnight in pure organic buffalo milk, topped with handpicked seasonal fruits and crunchy premium nuts. Zero added sugar.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "310 kcal", protein: "12g", carbs: "48g", fiber: "9g", fat: "8g" },
    benefit: "Steady morning energy release and improved digestion."
  },
  { 
    id: "b2", 
    name: "Dry Fruits Oats", 
    price: 130, 
    tags: ["High Protein", "Healthy Fats"], 
    category: "Overnight Oats Bowls",
    desc: "Classic organic oats slow-soaked in rich, creamy organic buffalo milk, loaded with premium raisins, almonds, walnuts, and select premium dried fruits. 100% clean nutrition.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "340 kcal", protein: "14g", carbs: "50g", fiber: "8g", fat: "10g" },
    benefit: "Packed with micronutrients and iron to enhance cognitive focus."
  },
  { 
    id: "b3", 
    name: "Fruit Oats", 
    price: 110, 
    tags: ["Fresh Fruits", "Fiber Rich"], 
    category: "Overnight Oats Bowls",
    desc: "Light and healthy oatmeal prepared with organic buffalo milk and topped with fresh seasonal fruit slices. Naturally sweetened, zero sugars or artificial colors.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "260 kcal", protein: "10g", carbs: "46g", fiber: "8g", fat: "4g" },
    benefit: "Vitamin-rich fruits support a healthy immune system."
  },
  { 
    id: "b4", 
    name: "High Protein Oats Chocolate", 
    price: 150, 
    tags: ["High Protein"], 
    category: "Overnight Oats Bowls",
    desc: "Protein-packed classic rolled oats infused with rich dark cocoa, organic plant protein, and pure organic buffalo milk. Zero sugars, zero artificial colors, nothing bad.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "380 kcal", protein: "28g", carbs: "42g", fiber: "8g", fat: "7g" },
    benefit: "Satisfies sweet cravings healthily while promoting muscle protein synthesis."
  },
  { 
    id: "b5", 
    name: "Muesli", 
    price: 125, 
    tags: ["Fiber Rich"], 
    category: "Overnight Oats Bowls",
    desc: "Traditional Swiss-style muesli featuring multi-grains, raw honey, select seeds, and sun-dried fruit bits. Best served with cold organic buffalo milk. Zero artificial colors.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "290 kcal", protein: "11g", carbs: "49g", fiber: "7g", fat: "6g" },
    benefit: "Heart-healthy grains aid cholesterol management."
  },
  { 
    id: "b6", 
    name: "Plain Oats (Soaked/Boiled)", 
    price: 90, 
    tags: ["Fiber Rich"], 
    category: "Overnight Oats Bowls",
    desc: "Simplicity at its best. Perfectly soaked in pure organic buffalo milk or slow-boiled. The classic healthy canvas for custom toppings. Zero sugars, zero artificial colors.",
    image: IMAGE_ASSETS.overnightOatsBowl,
    nutrition: { calories: "190 kcal", protein: "8g", carbs: "32g", fiber: "6g", fat: "3g" },
    benefit: "Beta-glucan fiber supports digestion and metabolic balance."
  },
  // 5. Cold Pressed Juices
  { 
    id: "b16", 
    name: "Green Detox Cold Pressed Juice", 
    price: 140, 
    tags: ["Fiber Rich"], 
    category: "Cold Pressed Juices",
    desc: "100% raw juice cold-pressed from fresh organic celery, green apple, cucumber, mint, and ginger. Zero water, zero sugars, zero preservatives.",
    image: IMAGE_ASSETS.coldPressedJuice,
    nutrition: { calories: "95 kcal", protein: "3g", carbs: "18g", fiber: "4g", fat: "0.5g" },
    benefit: "Highly alkalizing juice that flushes toxins and hydrates cells."
  },
  { 
    id: "b17", 
    name: "Pure Orange Cold Pressed Juice", 
    price: 130, 
    tags: ["Fresh Fruits"], 
    category: "Cold Pressed Juices",
    desc: "100% organic cold-pressed fresh oranges. High in Vitamin C, naturally sweet, zero sugars, zero added water.",
    image: IMAGE_ASSETS.coldPressedJuice,
    nutrition: { calories: "110 kcal", protein: "2g", carbs: "24g", fiber: "2g", fat: "0.2g" },
    benefit: "Burst of vitamin C provides skin health and immune defense."
  }
];
