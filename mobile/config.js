// API Configuration
export const API_BASE_URL = 'https://api.recipeapp.com/v1';
export const API_TIMEOUT = 15000; // 15 seconds

// Update with your local IP address or backend server address
export const API_URL = 'http://192.168.1.100:5000';

// App Configuration
export const APP_NAME = 'RecipeApp';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  VOICE_RECOGNITION: true,
  RECIPE_SHARING: true,
  OFFLINE_MODE: false,
  MEAL_PLANNING: true,
};

// Recipe Parser Configuration
export const PARSER_CONFIG = {
  DEFAULT_SERVING_SIZE: 4,
  COMMON_UNITS: [
    'cup', 'cups',
    'tbsp', 'tablespoon', 'tablespoons',
    'tsp', 'teaspoon', 'teaspoons',
    'oz', 'ounce', 'ounces',
    'lb', 'pound', 'pounds',
    'g', 'gram', 'grams',
    'kg', 'kilogram', 'kilograms',
    'ml', 'milliliter', 'milliliters',
    'l', 'liter', 'liters',
    'pinch', 'pinches',
    'dash', 'dashes',
  ],
  COMMON_INGREDIENT_SUBSTITUTIONS: {
    'butter': ['margarine', 'oil'],
    'milk': ['almond milk', 'soy milk', 'oat milk'],
    'flour': ['almond flour', 'coconut flour', 'gluten-free flour'],
    'sugar': ['honey', 'maple syrup', 'stevia'],
  },
};

// Unit Conversion Configuration
export const UNIT_CONVERSION = {
  VOLUME: {
    'tsp': 1,
    'tbsp': 3,
    'fl oz': 6,
    'cup': 48,
    'pint': 96,
    'quart': 192,
    'gallon': 768,
    'ml': 0.2,
    'l': 200,
  },
  WEIGHT: {
    'g': 1,
    'kg': 1000,
    'oz': 28.35,
    'lb': 453.59,
  },
};

// UI Configuration
export const UI_CONFIG = {
  PRIMARY_COLOR: '#4CAF50',
  SECONDARY_COLOR: '#2196F3',
  ACCENT_COLOR: '#FF9800',
  ERROR_COLOR: '#F44336',
  TEXT_COLOR: '#212121',
  BACKGROUND_COLOR: '#FFFFFF',
  LOADING_TIMEOUT: 5000,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SAVED_RECIPES: 'saved_recipes',
  GROCERY_LIST: 'grocery_list',
  AUTH_TOKEN: 'auth_token',
  RECENT_SEARCHES: 'recent_searches',
};

// Default Recipe Categories
export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizers',
  'Sides',
  'Desserts',
  'Beverages',
  'Snacks',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Quick & Easy',
];

export default {
  API_BASE_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
  FEATURES,
  PARSER_CONFIG,
  UNIT_CONVERSION,
  UI_CONFIG,
  STORAGE_KEYS,
  RECIPE_CATEGORIES,
};


