import { UNIT_CONVERSION } from '../config';

// Convert fractional strings to decimal numbers
const parseFraction = (fractionStr) => {
  if (!fractionStr) return 0;
  
  fractionStr = fractionStr.trim();
  
  // Handle unicode fractions
  const unicodeFractions = {
    '¼': 0.25,
    '½': 0.5,
    '¾': 0.75,
    '⅓': 1/3,
    '⅔': 2/3,
    '⅛': 1/8,
    '⅜': 3/8,
    '⅝': 5/8,
    '⅞': 7/8
  };
  
  if (unicodeFractions[fractionStr]) {
    return unicodeFractions[fractionStr];
  }
  
  // Handle mixed numbers (e.g., "1 1/2")
  if (fractionStr.includes(' ')) {
    const parts = fractionStr.split(' ');
    const whole = parseFloat(parts[0]);
    const fraction = parseFraction(parts[1]);
    return whole + fraction;
  }
  
  // Handle simple fractions (e.g., "1/2")
  if (fractionStr.includes('/')) {
    const [numerator, denominator] = fractionStr.split('/');
    return parseFloat(numerator) / parseFloat(denominator);
  }
  
  // Handle decimal numbers
  return parseFloat(fractionStr);
};

// Normalize unit strings to standard form
const normalizeUnit = (unit) => {
  if (!unit) return '';
  
  const unitMap = {
    // Volume
    'tbsp': 'tbsp',
    'tbs': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    
    'tsp': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    
    'cup': 'cup',
    'cups': 'cup',
    'c': 'cup',
    
    'fluid ounce': 'fl oz',
    'fluid ounces': 'fl oz',
    'fl oz': 'fl oz',
    'fl. oz.': 'fl oz',
    
    'pint': 'pint',
    'pints': 'pint',
    'pt': 'pint',
    
    'quart': 'quart',
    'quarts': 'quart',
    'qt': 'quart',
    
    'gallon': 'gallon',
    'gallons': 'gallon',
    'gal': 'gallon',
    
    'milliliter': 'ml',
    'milliliters': 'ml',
    'millilitre': 'ml',
    'millilitres': 'ml',
    'ml': 'ml',
    
    'liter': 'l',
    'liters': 'l',
    'litre': 'l',
    'litres': 'l',
    'l': 'l',
    
    // Weight
    'pound': 'lb',
    'pounds': 'lb',
    'lb': 'lb',
    'lbs': 'lb',
    
    'ounce': 'oz',
    'ounces': 'oz',
    'oz': 'oz',
    
    'gram': 'g',
    'grams': 'g',
    'g': 'g',
    
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kg': 'kg',
    
    // Other
    'pinch': 'pinch',
    'pinches': 'pinch',
    
    'dash': 'dash',
    'dashes': 'dash',
    
    'handful': 'handful',
    'handfuls': 'handful',
    
    'stick': 'stick',
    'sticks': 'stick',
    
    'clove': 'clove',
    'cloves': 'clove'
  };
  
  const normalized = unitMap[unit.toLowerCase()];
  return normalized || unit.toLowerCase();
};

// Convert a quantity from one unit to another
const convert = (quantity, fromUnit, toUnit) => {
  if (!quantity || !fromUnit || !toUnit) {
    return null;
  }
  
  const value = typeof quantity === 'string' ? parseFraction(quantity) : quantity;
  
  // Normalize units
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  
  // If units are the same, return original value
  if (from === to) {
    return value;
  }
  
  // Check if both units are in the same category
  const categoryMap = {};
  
  // Populate category map
  Object.keys(UNIT_CONVERSION).forEach(category => {
    Object.keys(UNIT_CONVERSION[category]).forEach(unit => {
      categoryMap[unit] = category;
    });
  });
  
  // If units are not in the same category, cannot convert
  if (!categoryMap[from] || !categoryMap[to] || categoryMap[from] !== categoryMap[to]) {
    return null;
  }
  
  const category = categoryMap[from];
  
  // Get conversion factors
  const fromFactor = UNIT_CONVERSION[category][from];
  const toFactor = UNIT_CONVERSION[category][to];
  
  if (!fromFactor || !toFactor) {
    return null;
  }
  
  // Convert using base unit as intermediary
  const baseValue = value * fromFactor;
  const result = baseValue / toFactor;
  
  return result;
};

// Scale a quantity by a factor
const scaleQuantity = (quantity, factor) => {
  if (!quantity || !factor) {
    return quantity;
  }
  
  const value = typeof quantity === 'string' ? parseFraction(quantity) : quantity;
  return value * factor;
};

// Format a decimal number as a fraction if appropriate
const formatQuantity = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // If it's already a string, return as is
  if (typeof value === 'string') {
    return value;
  }
  
  // For whole numbers, return as integer
  if (value % 1 === 0) {
    return value.toString();
  }
  
  // Common fractions to display nicely
  const fractions = {
    0.25: '¼',
    0.5: '½',
    0.75: '¾',
    0.33: '⅓',
    0.67: '⅔',
    0.125: '⅛',
    0.375: '⅜',
    0.625: '⅝',
    0.875: '⅞'
  };
  
  // Handle mixed numbers
  const whole = Math.floor(value);
  const decimal = value - whole;
  
  // Find closest fraction
  let closestFraction = '';
  let minDifference = 1;
  
  Object.entries(fractions).forEach(([decimalValue, fractionSymbol]) => {
    const diff = Math.abs(decimal - parseFloat(decimalValue));
    if (diff < minDifference) {
      minDifference = diff;
      closestFraction = fractionSymbol;
    }
  });
  
  // If we found a close fraction and it's reasonably close
  if (closestFraction && minDifference < 0.05) {
    return whole > 0 ? `${whole} ${closestFraction}` : closestFraction;
  }
  
  // Otherwise return with limited decimal places
  return value.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
};

export default {
  parseFraction,
  normalizeUnit,
  convert,
  scaleQuantity,
  formatQuantity
};
