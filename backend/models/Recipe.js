// models/Recipe.js - Recipe data schema

const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  notes: { type: String }
});

const StepSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  instruction: { type: String, required: true }
});

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  sourceUrl: { type: String },
  ingredients: [IngredientSchema],
  steps: [StepSchema],
  prepTime: { type: Number }, // in minutes
  cookTime: { type: Number }, // in minutes
  servings: { type: Number, default: 4 },
  image: { type: String },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Method to scale recipe ingredients by servings
RecipeSchema.methods.scaleIngredients = function(targetServings) {
  const scaleFactor = targetServings / this.servings;
  return this.ingredients.map(ingredient => ({
    ...ingredient.toObject(),
    amount: ingredient.amount * scaleFactor
  }));
};

module.exports = mongoose.model('Recipe', RecipeSchema);
