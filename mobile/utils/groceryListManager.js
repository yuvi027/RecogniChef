/**
 * groceryListManager.js
 * Utility for managing grocery lists in the recipe app
 */

class GroceryListManager {
  constructor() {
    this.groceryLists = {};
    this.initFromStorage();
  }

  /**
   * Initialize grocery lists from local storage
   */
  initFromStorage() {
    try {
      const savedLists = localStorage.getItem('groceryLists');
      if (savedLists) {
        this.groceryLists = JSON.parse(savedLists);
      }
    } catch (error) {
      console.error('Error loading grocery lists from storage:', error);
    }
  }

  /**
   * Save grocery lists to local storage
   */
  saveToStorage() {
    try {
      localStorage.setItem('groceryLists', JSON.stringify(this.groceryLists));
    } catch (error) {
      console.error('Error saving grocery lists to storage:', error);
    }
  }

  /**
   * Create a new grocery list
   * @param {string} listName - Name of the grocery list
   * @returns {boolean} - Success status
   */
  createList(listName) {
    if (!listName || this.groceryLists[listName]) {
      return false;
    }
    
    this.groceryLists[listName] = {
      items: [],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.saveToStorage();
    return true;
  }

  /**
   * Delete a grocery list
   * @param {string} listName - Name of the grocery list to delete
   * @returns {boolean} - Success status
   */
  deleteList(listName) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    delete this.groceryLists[listName];
    this.saveToStorage();
    return true;
  }

  /**
   * Get all grocery lists
   * @returns {Object} - All grocery lists
   */
  getAllLists() {
    return this.groceryLists;
  }

  /**
   * Get a specific grocery list
   * @param {string} listName - Name of the grocery list
   * @returns {Object|null} - Grocery list or null if not found
   */
  getList(listName) {
    return this.groceryLists[listName] || null;
  }

  /**
   * Add an item to a grocery list
   * @param {string} listName - Name of the grocery list
   * @param {Object} item - Item to add
   * @param {string} item.name - Name of the item
   * @param {number} item.quantity - Quantity of the item
   * @param {string} item.unit - Unit of measurement
   * @param {string} [item.category] - Category of the item
   * @param {string} [item.recipeSource] - Source recipe
   * @returns {boolean} - Success status
   */
  addItem(listName, item) {
    if (!this.groceryLists[listName] || !item.name) {
      return false;
    }
    
    // Check if item already exists to combine quantities
    const existingItemIndex = this.groceryLists[listName].items.findIndex(
      i => i.name.toLowerCase() === item.name.toLowerCase() && i.unit === item.unit
    );
    
    if (existingItemIndex >= 0) {
      this.groceryLists[listName].items[existingItemIndex].quantity += item.quantity || 1;
    } else {
      this.groceryLists[listName].items.push({
        id: Date.now().toString(),
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || '',
        category: item.category || 'Other',
        recipeSource: item.recipeSource || '',
        checked: false
      });
    }
    
    this.groceryLists[listName].lastModified = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Add multiple items from a recipe to a grocery list
   * @param {string} listName - Name of the grocery list
   * @param {Array} items - Array of items to add
   * @param {string} recipeSource - Recipe source name
   * @returns {boolean} - Success status
   */
  addItemsFromRecipe(listName, items, recipeSource) {
    if (!this.groceryLists[listName] || !Array.isArray(items)) {
      return false;
    }
    
    items.forEach(item => {
      this.addItem(listName, {
        ...item,
        recipeSource
      });
    });
    
    return true;
  }

  /**
   * Remove an item from a grocery list
   * @param {string} listName - Name of the grocery list
   * @param {string} itemId - ID of the item to remove
   * @returns {boolean} - Success status
   */
  removeItem(listName, itemId) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    const initialLength = this.groceryLists[listName].items.length;
    this.groceryLists[listName].items = this.groceryLists[listName].items.filter(
      item => item.id !== itemId
    );
    
    if (initialLength === this.groceryLists[listName].items.length) {
      return false;
    }
    
    this.groceryLists[listName].lastModified = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Update an item in a grocery list
   * @param {string} listName - Name of the grocery list
   * @param {string} itemId - ID of the item to update
   * @param {Object} updatedItem - Updated item data
   * @returns {boolean} - Success status
   */
  updateItem(listName, itemId, updatedItem) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    const itemIndex = this.groceryLists[listName].items.findIndex(
      item => item.id === itemId
    );
    
    if (itemIndex === -1) {
      return false;
    }
    
    this.groceryLists[listName].items[itemIndex] = {
      ...this.groceryLists[listName].items[itemIndex],
      ...updatedItem
    };
    
    this.groceryLists[listName].lastModified = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Toggle the checked status of an item
   * @param {string} listName - Name of the grocery list
   * @param {string} itemId - ID of the item
   * @returns {boolean} - Success status
   */
  toggleItemChecked(listName, itemId) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    const itemIndex = this.groceryLists[listName].items.findIndex(
      item => item.id === itemId
    );
    
    if (itemIndex === -1) {
      return false;
    }
    
    this.groceryLists[listName].items[itemIndex].checked = 
      !this.groceryLists[listName].items[itemIndex].checked;
    
    this.groceryLists[listName].lastModified = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Clear all checked items from a list
   * @param {string} listName - Name of the grocery list
   * @returns {boolean} - Success status
   */
  clearCheckedItems(listName) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    this.groceryLists[listName].items = this.groceryLists[listName].items.filter(
      item => !item.checked
    );
    
    this.groceryLists[listName].lastModified = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Sort items in a list by category
   * @param {string} listName - Name of the grocery list
   * @returns {boolean} - Success status
   */
  sortItemsByCategory(listName) {
    if (!this.groceryLists[listName]) {
      return false;
    }
    
    this.groceryLists[listName].items.sort((a, b) => {
      // First sort by category
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      
      // Then by name
      return a.name.localeCompare(b.name);
    });
    
    this.saveToStorage();
    return true;
  }

  /**
   * Export a grocery list as JSON
   * @param {string} listName - Name of the grocery list
   * @returns {string|null} - JSON string or null if list not found
   */
  exportListAsJson(listName) {
    if (!this.groceryLists[listName]) {
      return null;
    }
    
    return JSON.stringify(this.groceryLists[listName]);
  }
}

// Create and export a singleton instance
const groceryListManager = new GroceryListManager();
export default groceryListManager;
