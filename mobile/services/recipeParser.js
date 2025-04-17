import { PARSER_CONFIG } from '../config';

// Extract ingredient with quantity and unit from a text string
export const parseIngredient = (text) => {
  if (!text || typeof text !== 'string') return null;
  
  const cleanText = text.trim();
  if (!cleanText) return null;
  
  // Regular expression to match common quantity patterns
  // Captures: quantity, unit, ingredient name, and optional notes
  const regex = /^([\d¼½¾⅓⅔⅛⅜⅝⅞.\/\s-]+)?\s*([a-zA-Z]*\.?)?\s*(.+?)(?:\s*\((.*)\))?$/;
  
  const match = cleanText.match(regex);
  
  if (!match) return { name: cleanText };
  
  const [, quantity, unit, name, notes] = match;
  
  return {
    name: name ? name.trim() : '',
    quantity: quantity ? quantity.trim() : '',
    unit: unit ? unit.trim() : '',
    notes: notes ? notes.trim() : ''
  };
};

// Extract ingredient lists from text
export const extractIngredients = (text) => {
  if (!text) return [];
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  // Process each line as a potential ingredient
  const ingredients = lines.map(line => {
    // Check if line looks like an ingredient (contains measurements or common ingredient words)
    const hasNumber = /\d/.test(line);
    const hasUnit = PARSER_CONFIG.COMMON_UNITS.some(unit => 
      line.toLowerCase().includes(` ${unit} `) || 
      line.toLowerCase().includes(`${unit} `)
    );
    
    // If it looks like an ingredient, parse it
    if (hasNumber || hasUnit || line.trim().length < 50) {
      return parseIngredient(line);
    }
    
    return null;
  }).filter(item => item !== null);
  
  return ingredients;
};

// Extract steps from text
export const extractSteps = (text) => {
  if (!text) return [];
  
  // Look for common step indicators
  const stepPatterns = [
    /^\s*(\d+)[.)\]]\s+(.+)$/,  // "1. Step one" or "1) Step one" or "1] Step one"
    /^\s*Step\s+(\d+)[:.]\s*(.+)$/i,  // "Step 1: Do this"
    /^\s*([ivxlcdm]+)[.)\]]\s+(.+)$/i,  // "i. Step one" (Roman numerals)
  ];
  
  // Split text into lines
  const lines = text.split('\n').filter(line => line.trim());
  
  const steps = [];
  let currentStep = '';
  
  lines.forEach(line => {
    let isNewStep = false;
    let stepText = '';
    
    // Check if line matches any step pattern
    for (const pattern of stepPatterns) {
      const match = line.match(pattern);
      if (match) {
        isNewStep = true;
        stepText = match[2].trim();
        break;
      }
    }
    
    // If no pattern matches, check if the line starts with a number
    if (!isNewStep && /^\s*\d+\s+/.test(line)) {
      isNewStep = true;
      stepText = line.replace(/^\s*\d+\s+/, '').trim();
    }
    
    // If no pattern matches and line is short, might be a step without numbering
    if (!isNewStep && line.length < 200 && line.length > 10) {
      // If previous step was saved and line doesn't look like a continuation (starts with capital)
      if (currentStep && /^[A-Z]/.test(line.trim())) {
        isNewStep = true;
        stepText = line.trim();
      }
    }
    
    if (isNewStep) {
      // Save previous step if exists
      if (currentStep) {
        steps.push({
          instruction: currentStep,
          timers: extractTimersFromText(currentStep)
        });
      }
      currentStep = stepText;
    } else {
      // Append to current step
      if (currentStep) {
        currentStep += ' ' + line.trim();
      } else {
        currentStep = line.trim();
      }
    }
  });
  
  // Add the last step
  if (currentStep) {
    steps.push({
      instruction: currentStep,
      timers: extractTimersFromText(currentStep)
    });
  }
  
  return steps;
};

// Extract cooking times from text
export const extractCookingTimes = (text) => {
  if (!text) return { prepTime: '', cookTime: '' };
  
  const prepTimeRegex = /prep(?:aration)?\s*time:?\s*(\d+)\s*(?:min|minute|hour|hr)/i;
  const cookTimeRegex = /cook(?:ing)?\s*time:?\s*(\d+)\s*(?:min|minute|hour|hr)/i;
  
  let prepTime = '';
  let cookTime = '';
  
  const prepMatch = text.match(prepTimeRegex);
  if (prepMatch) {
    prepTime = prepMatch[1];
  }
  
  const cookMatch = text.match(cookTimeRegex);
  if (cookMatch) {
    cookTime = cookMatch[1];
  }
  
  return { prepTime, cookTime };
};

// Extract timers from step text (e.g., "cook for 5 minutes")
export const extractTimersFromText = (text) => {
  if (!text) return [];
  
  // Match patterns like "X minutes", "X min", "X hours", etc.
  const timerRegex = /(\d+)\s*(?:min(?:ute)?s?|hour(?:s)?|hr(?:s)?)/gi;
  const timers = [];
  let match;
  
  while ((match = timerRegex.exec(text)) !== null) {
    // Convert to minutes
    let minutes = parseInt(match[1], 10);
    if (match[0].toLowerCase().includes('hour')) {
      minutes *= 60;
    }
    
    // Only include timers that are reasonable cooking times (1-180 minutes)
    if (minutes >= 1 && minutes <= 180) {
      timers.push(minutes);
    }
  }
  
  return timers;
};

// Extract title from text
export const extractTitle = (text) => {
  if (!text) return '';
  
  // Split into lines and take the first non-empty line
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length > 0) {
    // If the first line is short, it's likely a title
    const firstLine = lines[0].trim();
    if (firstLine.length < 100) {
      return firstLine;
    }
  }
  
  return '';
};

// Extract servings info
export const extractServings = (text) => {
  if (!text) return PARSER_CONFIG.DEFAULT_SERVING_SIZE;
  
  // Look for common serving patterns
  const servingsRegex = /(?:serve|serving|yield|makes)s?\s*(?:about|approximately)?\s*:?\s*(\d+)(?:\s*-\s*\d+)?/i;
  const match = text.match(servingsRegex);
  
  if (match) {
    return match[1];
  }
  
  return PARSER_CONFIG.DEFAULT_SERVING_SIZE;
};

// Main function to parse recipe from plain text
export const parseRecipeFromText = (text) => {
  if (!text) return null;
  
  const title = extractTitle(text);
  const { prepTime, cookTime } = extractCookingTimes(text);
  const servings = extractServings(text);
  const ingredients = extractIngredients(text);
  const steps = extractSteps(text);
  
  return {
    title,
    prepTime,
    cookTime,
    servings,
    ingredients,
    steps
  };
};

// Parse recipe from voice transcription
export const parseRecipeFromVoice = (transcript) => {
  // Voice transcripts might need different parsing strategies
  // For MVP, use the same parser as text
  return parseRecipeFromText(transcript);
};

export default {
  parseIngredient,
  extractIngredients,
  extractSteps,
  extractCookingTimes,
  extractTitle,
  extractServings,
  parseRecipeFromText,
  parseRecipeFromVoice
};
