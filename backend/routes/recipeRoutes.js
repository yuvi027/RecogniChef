// routes/recipeRoutes.js - API endpoints for recipe management

const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Get all recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().select('title image servings prepTime cookTime');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a recipe
router.post('/', async (req, res) => {
  const recipe = new Recipe(req.body);
  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a recipe
router.patch('/:id', async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Scale a recipe
router.get('/:id/scale/:servings', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const targetServings = parseInt(req.params.servings);
    if (isNaN(targetServings) || targetServings <= 0) {
      return res.status(400).json({ message: 'Invalid servings value' });
    }
    
    const scaledIngredients = recipe.scaleIngredients(targetServings);
    
    res.json({
      ...recipe.toObject(),
      ingredients: scaledIngredients,
      servings: targetServings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
