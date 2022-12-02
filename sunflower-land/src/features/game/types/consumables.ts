import Decimal from "decimal.js-light";
import { BuildingName } from "./buildings";
import { Cake } from "./craftables";
import { Inventory } from "./game";

export type ConsumableName =
  | "Mashed Potato"
  | "Pumpkin Soup"
  | "Bumpkin Broth"
  | "Boiled Eggs"
  | "Mushroom Soup"
  | "Roast Veggies"
  | "Bumpkin Salad"
  | "Cauliflower Burger"
  | "Mushroom Jacket Potatoes"
  | "Goblin's Treat"
  | "Club Sandwich"
  | "Kale Stew"
  | "Pancakes"
  | "Kale & Mushroom Pie"
  | "Fermented Carrots"
  | "Sauerkraut"
  | "Blueberry Jam"
  | "Apple Pie"
  | "Orange Cake"
  | "Honey Cake"
  | "Sunflower Crunch"
  | Cake;

export type Consumable = {
  experience: number;
  name: ConsumableName;
  description: string;
  ingredients: Inventory;
  cookingSeconds: number;
  building: BuildingName;
  // SFL sell rate
  marketRate: number;
};

export const CONSUMABLES: Record<ConsumableName, Consumable> = {
  "Mashed Potato": {
    name: "Mashed Potato",
    description: "My life is potato.",
    experience: 3,
    building: "Fire Pit",
    cookingSeconds: 60,
    ingredients: {
      Potato: new Decimal(10),
    },
    marketRate: 10,
  },
  "Pumpkin Soup": {
    name: "Pumpkin Soup",
    description: "Boiled Eggss are always a good breakfast choice",
    experience: 24,
    building: "Fire Pit",
    cookingSeconds: 60 * 3,
    ingredients: {
      Pumpkin: new Decimal(10),
    },
    marketRate: 16,
  },

  "Bumpkin Broth": {
    name: "Bumpkin Broth",
    description: "A perfect broth for a cold day.",
    experience: 96,
    building: "Fire Pit",
    cookingSeconds: 60 * 20,
    ingredients: {
      Carrot: new Decimal(10),
      Cabbage: new Decimal(5),
    },
    marketRate: 64,
  },

  "Boiled Eggs": {
    name: "Boiled Eggs",
    description: "Boiled Eggss are always a good breakfast choice",
    experience: 90,
    building: "Fire Pit",
    cookingSeconds: 60 * 60,
    ingredients: {
      Egg: new Decimal(5),
    },
    marketRate: 160,
  },

  "Kale Stew": {
    name: "Kale Stew",
    description: "A perfect Bumpkin Booster",
    building: "Fire Pit",
    cookingSeconds: 60 * 60 * 2,
    ingredients: {
      Kale: new Decimal(10),
    },
    experience: 175,
    marketRate: 304,
  },

  "Roast Veggies": {
    name: "Roast Veggies",
    description: "Even Goblin's need to eat their veggies!",
    experience: 170,
    building: "Kitchen",
    cookingSeconds: 60 * 60 * 2,
    ingredients: {
      Cauliflower: new Decimal(15),
      Carrot: new Decimal(10),
    },
    marketRate: 240,
  },

  "Bumpkin Salad": {
    name: "Bumpkin Salad",
    description: "Gotta keep your Bumpkin healthy!",
    experience: 290,
    building: "Kitchen",
    cookingSeconds: 60 * 60 * 3.5,
    ingredients: {
      Beetroot: new Decimal(20),
      Parsnip: new Decimal(10),
    },
    marketRate: 400,
  },

  "Goblin's Treat": {
    name: "Goblin's Treat",
    description: "Boiled Eggss are always a good breakfast choice",
    experience: 500,
    building: "Kitchen",
    cookingSeconds: 60 * 60 * 6,
    ingredients: {
      Pumpkin: new Decimal(10),
      Radish: new Decimal(20),
      Cabbage: new Decimal(10),
    },
    marketRate: 800,
  },

  "Cauliflower Burger": {
    name: "Cauliflower Burger",
    description: "Calling all cauliflower lovers!",
    experience: 255,
    building: "Kitchen",
    cookingSeconds: 60 * 60 * 3,
    ingredients: {
      Cauliflower: new Decimal(15),
      Wheat: new Decimal(5),
    },
    marketRate: 304,
  },

  Pancakes: {
    name: "Pancakes",
    description: "A great start to a Bumpkins day",
    experience: 480,
    building: "Kitchen",
    cookingSeconds: 60 * 20,
    ingredients: {
      Wheat: new Decimal(5),
      Honey: new Decimal(10),
    },
    marketRate: 10,
  },

  "Club Sandwich": {
    name: "Club Sandwich",
    description: "Filled with Carrots and Roasted Sunflower Seeds",
    experience: 170,
    building: "Kitchen",
    cookingSeconds: 60 * 60 * 3,
    ingredients: {
      Sunflower: new Decimal(100),
      Carrot: new Decimal(25),
      Wheat: new Decimal(5),
    },
    marketRate: 184,
  },

  "Sunflower Cake": {
    name: "Sunflower Cake",
    description: "Sunflower Cake",
    building: "Bakery",
    experience: 525,
    cookingSeconds: 60 * 60 * 6.5,
    ingredients: {
      Sunflower: new Decimal(1000),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 440,
  },
  "Potato Cake": {
    name: "Potato Cake",
    description: "Potato Cake",
    building: "Bakery",
    experience: 650,
    cookingSeconds: 60 * 60 * 10.5,
    ingredients: {
      Potato: new Decimal(500),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 560,
  },
  "Pumpkin Cake": {
    name: "Pumpkin Cake",
    description: "Pumpkin Cake",
    building: "Bakery",
    experience: 625,
    cookingSeconds: 60 * 60 * 10.5,
    ingredients: {
      Pumpkin: new Decimal(130),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 520,
  },
  "Carrot Cake": {
    name: "Carrot Cake",
    description: "Carrot Cake",
    building: "Bakery",
    experience: 750,
    cookingSeconds: 60 * 60 * 13,
    ingredients: {
      Carrot: new Decimal(120),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 600,
  },
  "Cabbage Cake": {
    name: "Cabbage Cake",
    description: "Cabbage Cake",
    building: "Bakery",
    experience: 860,
    cookingSeconds: 60 * 60 * 15,
    ingredients: {
      Cabbage: new Decimal(90),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 720,
  },
  "Beetroot Cake": {
    name: "Beetroot Cake",
    description: "Beetroot Cake",
    building: "Bakery",
    experience: 1250,
    cookingSeconds: 60 * 60 * 22,
    ingredients: {
      Beetroot: new Decimal(100),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 960,
  },
  "Cauliflower Cake": {
    name: "Cauliflower Cake",
    description: "Cauliflower Cake",
    building: "Bakery",
    experience: 1190,
    cookingSeconds: 60 * 60 * 22,
    ingredients: {
      Cauliflower: new Decimal(60),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 960,
  },
  "Parsnip Cake": {
    name: "Parsnip Cake",
    description: "Parsnip Cake",
    building: "Bakery",
    experience: 1300,
    cookingSeconds: 60 * 60 * 24,
    ingredients: {
      Parsnip: new Decimal(45),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 960,
  },
  "Radish Cake": {
    name: "Radish Cake",
    description: "Radish Cake",
    building: "Bakery",
    experience: 1200,
    cookingSeconds: 60 * 60 * 24,
    ingredients: {
      Radish: new Decimal(25),
      Wheat: new Decimal(10),
      Egg: new Decimal(15),
    },
    marketRate: 880,
  },
  "Wheat Cake": {
    name: "Wheat Cake",
    description: "Wheat Cake",
    building: "Bakery",
    experience: 1100,
    cookingSeconds: 60 * 60 * 24,
    ingredients: {
      Wheat: new Decimal(35),
      Egg: new Decimal(15),
    },
    marketRate: 800,
  },
  "Apple Pie": {
    name: "Apple Pie",
    description: "Bumpkin Betty's famous recipe",
    building: "Bakery",
    experience: 720,
    cookingSeconds: 60 * 240,
    ingredients: {
      Apple: new Decimal(5),
      Wheat: new Decimal(10),
      Egg: new Decimal(10),
    },
    marketRate: 550,
  },
  "Blueberry Jam": {
    name: "Blueberry Jam",
    description: "Goblin's will do anything for this jam",
    building: "Deli",
    experience: 380,
    cookingSeconds: 60 * 24 * 60,
    ingredients: {
      Blueberry: new Decimal(5),
    },
    marketRate: 550,
  },
  "Fermented Carrots": {
    name: "Fermented Carrots",
    description: "Got a surplus of carrots?",
    building: "Deli",
    experience: 250,
    cookingSeconds: 60 * 24 * 60,
    ingredients: {
      Carrot: new Decimal(20),
    },
    marketRate: 112,
  },
  "Honey Cake": {
    name: "Honey Cake",
    description: "A scrumptious cake!",
    building: "Bakery",
    experience: 760,
    cookingSeconds: 60 * 240,
    ingredients: {
      Honey: new Decimal(10),
      Wheat: new Decimal(10),
      Egg: new Decimal(10),
    },
    marketRate: 550,
  },
  "Kale & Mushroom Pie": {
    name: "Kale & Mushroom Pie",
    description: "A traditional Saphiron recipe",
    building: "Bakery",
    cookingSeconds: 60 * 240,
    experience: 720,
    ingredients: {
      "Wild Mushroom": new Decimal(10),
      Kale: new Decimal(5),
      Wheat: new Decimal(5),
    },
    marketRate: 550,
  },

  "Mushroom Jacket Potatoes": {
    name: "Mushroom Jacket Potatoes",
    description: "Cram them taters with what ya got!",
    building: "Kitchen",
    cookingSeconds: 10 * 60,
    experience: 240,
    ingredients: {
      "Wild Mushroom": new Decimal(10),
      Potato: new Decimal(5),
    },
    marketRate: 240,
  },
  "Mushroom Soup": {
    name: "Mushroom Soup",
    description: "Warm your Bumpkin's soul.",
    building: "Fire Pit",
    cookingSeconds: 10 * 60,
    experience: 56,
    ingredients: {
      "Wild Mushroom": new Decimal(5),
    },
    marketRate: 240,
  },
  "Orange Cake": {
    name: "Orange Cake",
    description: "Orange you glad we aren't cooking apples",
    building: "Bakery",
    cookingSeconds: 240 * 60,
    ingredients: {
      Orange: new Decimal(5),
      Egg: new Decimal(15),
      Wheat: new Decimal(10),
    },
    experience: 730,
    marketRate: 600,
  },
  "Sunflower Crunch": {
    name: "Sunflower Crunch",
    description: "Crunchy goodness. Try not to burn it.",
    building: "Kitchen",
    cookingSeconds: 10 * 60,
    experience: 50,
    ingredients: {
      Sunflower: new Decimal(300),
    },
    marketRate: 40,
  },
  Sauerkraut: {
    name: "Sauerkraut",
    description: "No more boring Cabbage!",
    building: "Deli",
    cookingSeconds: 24 * 60 * 60,
    experience: 500,
    ingredients: {
      Cabbage: new Decimal(20),
    },
    marketRate: 224,
  },
};
