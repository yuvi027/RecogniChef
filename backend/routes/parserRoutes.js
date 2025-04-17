// routes/parserRoutes.js - API endpoints for recipe parsing

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// Parse recipe from URL
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const response = await axios.get(url);
    const html = response.data;
    const recipe = parseRecipeFromHtml(html, url);
    
    res.json(recipe);
  } catch (err) {
    console.error('Error parsing recipe:', err);
    res.status(500).json({ message: 'Failed to parse recipe' });
  }
});

// Parse recipe from text
router.post('/text', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Recipe text is required' });
    }

    const recipe = parseRecipeFromText(text);
    res.json(recipe);
  } catch (err) {
    console.error('Error parsing recipe text:', err);
    res.status(500).json({ message: 'Failed to parse recipe text' });
  }
});

// Helper function to parse recipe from HTML
function parseRecipeFromHtml(html, sourceUrl) {
  const $ = cheerio.load(html);
  let recipe = {
    title: $('h1').first().text().trim() || $('title').text().trim(),
    sourceUrl,
    ingredients: [],
    steps: []
  };

  // Basic parsing logic - will need improvement for production
  // Look for common recipe page patterns
  
  // Find ingredients
  $('ul li').each((i, el) => {
    const text = $(el).text().trim();
    if (text && isLikelyIngredient(text)) {
      const parsedIngredient = parseIngredientText(text);
      recipe.ingredients.push(parsedIngredient);
    }
  });

  // Find steps
  $('ol li').each((i, el) => {
    recipe.steps.push({
      number: i + 1,
      instruction: $(el).text().trim()
    });
  });

  // Get cooking time if available
  const timeText = $('*:contains("minutes")').first().text();
  if (timeText) {
    const cookTimeMatch = timeText.match(/(\d+)\s*minutes/i);
    if (cookTimeMatch) {
      recipe.cookTime = parseInt(cookTimeMatch[1]);
    }
  }

  // Get servings if available
  const servingsText = $('*:contains("servings")').first().text();
  if (servingsText) {
    const servingsMatch = servingsText.match(/(\d+)\s*servings/i);
    if (servingsMatch) {
      recipe.servings = parseInt(servingsMatch[1]);
    }
  }

  return recipe;
}

// Helper function to parse recipe from plain text
function parseRecipeFromText(text) {
  // Simple recipe parser for text
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // First non-empty line is likely the title
  const title = lines[0];
  
  const ingredients = [];
  const steps = [];
  let currentSection = null;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (line.includes('ingredient') || line.includes('you will need')) {
      currentSection = 'ingredients';
      continue;
    } else if (line.includes('instruction') || line.includes('direction') || line.includes('steps')) {
      currentSection = 'steps';
      continue;
    }
    
    if (currentSection === 'ingredients' && isLikelyIngredient(lines[i])) {
      ingredients.push(parseIngredientText(lines[i]));
    } else if (currentSection === 'steps') {
      // Remove numbers at the beginning of the line
      let stepText = lines[i].replace(/^\d+[\.\)]\s*/, '');
      steps.push({
        number: steps.length + 1,
        instruction: stepText
      });
    }
  }
  
  return {
    title,
    ingredients,
    steps,
    servings: 4 // Default value
  };
}

// Helper to check if a text is likely an ingredient
function isLikelyIngredient(text) {
  // Ingredients often contain measurements and food items
  const measurementPatterns = /\d+\s*(cup|tbsp|tsp|tablespoon|teaspoon|ounce|oz|pound|lb|g|kg|ml|l)/i;
  const foodWordPatterns = /(salt|pepper|sugar|flour|oil|butter|water|milk|egg|cheese|chicken|beef|pork|fish|rice|pasta)/i;
  
  return measurementPatterns.test(text) || foodWordPatterns.test(text);
}

// Helper to parse ingredient text into structured data
function parseIngredientText(text) {
  // This is a simplified version - would need more complex parsing for production
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:(\d+)\/(\d+))?\s*(cup|tbsp|tsp|tablespoon|teaspoon|ounce|oz|pound|lb|g|kg|ml|l)?/i);
  
  let amount = 1;
  let unit = '';
  
  if (amountMatch) {
    // Handle whole numbers
    if (amountMatch[1]) {
      amount = parseFloat(amountMatch[1]);
    }
    
    // Handle fractions
    if (amountMatch[2] && amountMatch[3]) {
      amount += parseInt(amountMatch[2]) / parseInt(amountMatch[3]);
    }
    
    // Get unit
    unit = amountMatch[4] || '';
  }
  
  // Get ingredient name (everything after the amount and unit)
  let name = text;
  if (amountMatch && amountMatch[0]) {
    name = text.substring(text.indexOf(amountMatch[0]) + amountMatch[0].length).trim();
  }
  
  // Remove leading 'of' if present
  name = name.replace(/^of\s+/i, '');
  
  return {
    name,
    amount,
    unit: unit.toLowerCase(),
    notes: ''
  };
}

module.exports = router;
