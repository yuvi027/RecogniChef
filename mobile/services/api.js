// import axios from 'axios';
// import { API_BASE_URL } from '../config';

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Recipe endpoints
// export const getRecipes = async () => {
//   try {
//     const response = await api.get('/recipes');
//     return response.data;
//   } catch (error) {
//     console.error('API Error - getRecipes:', error);
//     throw error;
//   }
// };

// export const getRecipeById = async (id) => {
//   try {
//     const response = await api.get(`/recipes/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error(`API Error - getRecipeById(${id}):`, error);
//     throw error;
//   }
// };

// export const addRecipe = async (recipeData) => {
//   try {
//     const response = await api.post('/recipes', recipeData);
//     return response.data;
//   } catch (error) {
//     console.error('API Error - addRecipe:', error);
//     throw error;
//   }
// };

// export const updateRecipe = async (id, recipeData) => {
//   try {
//     const response = await api.put(`/recipes/${id}`, recipeData);
//     return response.data;
//   } catch (error) {
//     console.error(`API Error - updateRecipe(${id}):`, error);
//     throw error;
//   }
// };

// export const deleteRecipe = async (id) => {
//   try {
//     await api.delete(`/recipes/${id}`);
//     return true;
//   } catch (error) {
//     console.error(`API Error - deleteRecipe(${id}):`, error);
//     throw error;
//   }
// };

// // Recipe parsing endpoints
// export const parseRecipeUrl = async (url) => {
//   try {
//     const response = await api.post('/parse/url', { url });
//     return response.data;
//   } catch (error) {
//     console.error('API Error - parseRecipeUrl:', error);
//     throw error;
//   }
// };

// export const parseRecipeText = async (text) => {
//   try {
//     const response = await api.post('/parse/text', { text });
//     return response.data;
//   } catch (error) {
//     console.error('API Error - parseRecipeText:', error);
//     throw error;
//   }
// };

// // Grocery list endpoints
// export const getGroceryList = async () => {
//   try {
//     const response = await api.get('/grocery-list');
//     return response.data;
//   } catch (error) {
//     console.error('API Error - getGroceryList:', error);
//     throw error;
//   }
// };

// export const addGroceryItem = async (item) => {
//   try {
//     const response = await api.post('/grocery-list', item);
//     return response.data;
//   } catch (error) {
//     console.error('API Error - addGroceryItem:', error);
//     throw error;
//   }
// };

// export const removeGroceryItem = async (id) => {
//   try {
//     await api.delete(`/grocery-list/${id}`);
//     return true;
//   } catch (error) {
//     console.error(`API Error - removeGroceryItem(${id}):`, error);
//     throw error;
//   }
// };

// export const toggleItemCompleted = async (id, completed) => {
//   try {
//     const response = await api.patch(`/grocery-list/${id}`, { completed });
//     return response.data;
//   } catch (error) {
//     console.error(`API Error - toggleItemCompleted(${id}):`, error);
//     throw error;
//   }
// };

// export const addRecipeToGroceryList = async (recipeId, servings) => {
//   try {
//     const response = await api.post('/grocery-list/add-recipe', { 
//       recipeId, 
//       servings: servings || 1 
//     });
//     return response.data;
//   } catch (error) {
//     console.error('API Error - addRecipeToGroceryList:', error);
//     throw error;
//   }
// };

// // Ingredient search endpoint
// export const searchRecipesByIngredients = async (ingredients) => {
//   try {
//     const response = await api.post('/recipes/search-by-ingredients', { ingredients });
//     return response.data;
//   } catch (error) {
//     console.error('API Error - searchRecipesByIngredients:', error);
//     throw error;
//   }
// };

// export default api;


import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Recipe endpoints
export const getRecipes = async () => {
  try {
    const response = await api.get('/api/recipes');
    return response.data;
  } catch (error) {
    console.error('API Error - getRecipes:', error);
    throw error;
  }
};

export const getRecipeById = async (id) => {
  try {
    const response = await api.get(`/api/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error - getRecipeById(${id}):`, error);
    throw error;
  }
};

export const addRecipe = async (recipeData) => {
  try {
    const response = await api.post('/api/recipes', recipeData);
    return response.data;
  } catch (error) {
    console.error('API Error - addRecipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id, recipeData) => {
  try {
    const response = await api.put(`/api/recipes/${id}`, recipeData);
    return response.data;
  } catch (error) {
    console.error(`API Error - updateRecipe(${id}):`, error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    await api.delete(`/api/recipes/${id}`);
    return true;
  } catch (error) {
    console.error(`API Error - deleteRecipe(${id}):`, error);
    throw error;
  }
};

export const scaleRecipe = async (id, servings) => {
  try {
    const response = await api.get(`/api/recipes/${id}/scale/${servings}`);
    return response.data;
  } catch (error) {
    console.error(`API Error - scaleRecipe(${id}, ${servings}):`, error);
    throw error;
  }
};

// Recipe parsing endpoints
export const parseRecipeUrl = async (url) => {
  try {
    const response = await api.post('/api/parse/url', { url });
    return response.data;
  } catch (error) {
    console.error('API Error - parseRecipeUrl:', error);
    throw error;
  }
};

export const parseRecipeText = async (text) => {
  try {
    const response = await api.post('/api/parse/text', { text });
    return response.data;
  } catch (error) {
    console.error('API Error - parseRecipeText:', error);
    throw error;
  }
};

export default api;